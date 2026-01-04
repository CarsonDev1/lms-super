import { useEffect, useRef, useCallback } from 'react';
import { useQuery, type Pagination } from '@/stores/queryStore';

interface FetchOptions<T = any> {
	skip?: boolean; // Bỏ qua fetch
	refetch?: boolean; // Force refetch dù đã có cache
	onSuccess?: (data: T) => void;
	onError?: (error: any) => void;
}

interface FetchResult<T> {
	data: T | undefined;
	pagination: Pagination | undefined;
	loading: boolean;
	error: any;
	refetch: () => void;
}

/**
 * Custom hook để fetch dữ liệu từ API với auto caching + pagination
 * @param key - Unique key cho cache (ví dụ: 'categories', 'users')
 * @param fetchFn - Async function để gọi API
 * @param options - Tuỳ chọn (skip, refetch, callbacks)
 * @returns { data, pagination, loading, error, refetch }
 */
export const useFetch = <T = any>(
	key: string,
	fetchFn: () => Promise<any>,
	options?: FetchOptions<T[]>
): FetchResult<T[]> => {
	const { data, loading, error, setData, setLoading, setError, getCache, setPagination, getPagination } = useQuery();
	const hasRunRef = useRef(false);

	const cachedData = getCache(key) as T[] | undefined;
	const cachedPagination = getPagination(key);

	// Helper để extract data từ response - wrapped in useCallback để tránh recreate
	const extractDataAndPagination = useCallback((response: any): { data: T[]; pagination?: Pagination } => {
		// Nếu là axios response, lấy .data
		const payload = response?.data || response;

		// Nếu payload là array trực tiếp
		if (Array.isArray(payload)) {
			return { data: payload };
		}

		// Tìm array đầu tiên trong object (đó là data list)
		let dataList: T[] = [];
		let foundPagination: Pagination | undefined;

		for (const [k, v] of Object.entries(payload || {})) {
			if (Array.isArray(v)) {
				dataList = v as T[];
			}
			if (k === 'pagination' && typeof v === 'object') {
				foundPagination = v as Pagination;
			}
		}

		return { data: dataList, pagination: foundPagination };
	}, []);

	// Hàm chung để fetch
	const performFetch = useCallback(async () => {
		try {
			setLoading(key, true);
			const result = await fetchFn();
			const { data: responseData, pagination } = extractDataAndPagination(result);

			setData(key, responseData);
			if (pagination) {
				setPagination(key, pagination);
			}
			options?.onSuccess?.(responseData);
		} catch (err) {
			setError(key, err);
			options?.onError?.(err);
		} finally {
			setLoading(key, false);
		}
	}, [key, fetchFn, options, extractDataAndPagination, setData, setLoading, setError, setPagination]);

	useEffect(() => {
		// Bỏ qua nếu skip = true
		if (options?.skip) return;

		// Nếu đã có cache và không force refetch, dùng cache
		if (cachedData !== undefined && !options?.refetch && !hasRunRef.current) {
			setData(key, cachedData);
			if (cachedPagination) {
				setPagination(key, cachedPagination);
			}
			return;
		}

		// Tránh fetch lặp lại khi StrictMode
		if (hasRunRef.current && !options?.refetch) return;
		hasRunRef.current = true;

		performFetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key, options?.refetch]);

	const refetch = useCallback(() => {
		hasRunRef.current = false;
		setData(key, undefined);
		performFetch();
	}, [key, performFetch, setData]);

	return {
		data: data[key] as T[] | undefined,
		pagination: cachedPagination,
		loading: loading[key] || false,
		error: error[key],
		refetch,
	};
};
