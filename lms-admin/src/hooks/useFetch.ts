import { useEffect, useRef, useCallback, useState } from 'react';
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
	options?: FetchOptions<T[]>,
	deps: any[] = [], // Add dependencies array
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

		// Reset hasRunRef when deps change (to allow refetch on dependency changes)
		hasRunRef.current = false;

		// Nếu đã có cache và không force refetch, dùng cache
		if (cachedData !== undefined && !options?.refetch) {
			setData(key, cachedData);
			if (cachedPagination) {
				setPagination(key, cachedPagination);
			}
			// But still perform fetch to update data
		}

		performFetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key, options?.refetch, ...deps]); // Add deps to dependency array

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

/**
 * Wrapper for useFetch that handles pagination state internally
 */
export const usePaginatedFetch = <T = any>(
	key: string,
	fetchFn: (params: { page: number; limit: number }) => Promise<any>,
	options?: FetchOptions<T[]>,
	initialPage: number = 1,
	initialPageSize: number = 10,
) => {
	const [page, setPage] = useState(initialPage);
	const [pageSize, setPageSize] = useState(initialPageSize);

	const { data, pagination, loading, error, refetch } = useFetch<T>(
		key,
		() => fetchFn({ page, limit: pageSize }),
		options,
		[page, pageSize],
	);

	return {
		data,
		pagination,
		loading,
		error,
		refetch,
		page,
		setPage,
		pageSize,
		setPageSize,
	};
};
