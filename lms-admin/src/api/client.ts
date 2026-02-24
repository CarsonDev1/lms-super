import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string | null) => void;
	reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

// Tạo axios instance
const apiClient: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30000,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true, // Cho phép gửi cookie
});

// Request interceptor
apiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error: AxiosError) => {
		return Promise.reject(error);
	},
);

// Response interceptor
apiClient.interceptors.response.use(
	(response: AxiosResponse) => {
		return response.data;
	},
	async (error: AxiosError) => {
		const originalRequest: any = error.config;

		// Không retry nếu đang ở trang login hoặc đang gọi API auth
		const isAuthEndpoint = originalRequest.url?.includes('/auth/');
		const isLoginPage = window.location.pathname === '/login';

		// Nếu lỗi 401 và chưa retry và không phải endpoint auth
		if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
			if (isRefreshing) {
				// Nếu đang refresh, đợi trong queue
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						return apiClient(originalRequest);
					})
					.catch((err) => {
						return Promise.reject(err);
					});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				// Gọi refresh token (cookie tự động gửi)
				const refreshRes = (await apiClient.post('/auth/refresh')) as { data: { accessToken: string } };
				const accessToken = refreshRes.data?.accessToken;

				if (!accessToken) {
					throw new Error('Refresh failed: No access token in response');
				}

				// Lưu access token mới vào cả localStorage và authStore
				localStorage.setItem('token', accessToken);
				useAuthStore.setState((state) => ({ ...state, token: accessToken }));

				// Cập nhật token cho request đang chờ
				processQueue(null, accessToken);

				// Retry request gốc với token mới
				originalRequest.headers.Authorization = `Bearer ${accessToken}`;
				return apiClient(originalRequest);
			} catch (refreshError) {
				// Refresh thất bại, xóa token và logout
				processQueue(refreshError, null);
				localStorage.removeItem('token');
				useAuthStore.setState({ user: null, token: null, isAuthenticated: false });

				// Chỉ redirect nếu chưa ở trang login
				if (!isLoginPage) {
					window.location.href = '/login';
				}
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		// Nếu 401 ở endpoint auth, xóa token và redirect
		if (error.response?.status === 401 && isAuthEndpoint && !isLoginPage) {
			localStorage.removeItem('token');
			window.location.href = '/login';
		}

		if (error.response?.status === 403) {
			message.error('You do not have permission to perform this action.');
		}

		return Promise.reject(error.response?.data || error.message);
	},
);

// Export helper functions
export const get = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
	return apiClient.get(url, config);
};

export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
	return apiClient.post(url, data, config);
};

export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
	return apiClient.put(url, data, config);
};

export const patch = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
	return apiClient.patch(url, data, config);
};

export const deleteRequest = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
	return apiClient.delete(url, config);
};

export default apiClient;
