import { useCallback, useState } from 'react';

interface UseFormModalState {
	isOpen: boolean;
	isDirty: boolean;
	loading: boolean;
	data: Record<string, any> | null;
}

interface UseFormModalActions {
	openModal: (initialData?: Record<string, any>) => void;
	closeModal: () => void;
	setDirty: (isDirty: boolean) => void;
	setLoading: (isLoading: boolean) => void;
	setData: (data: Record<string, any>) => void;
	reset: () => void;
}

export const useFormModal = (initialData?: Record<string, any>): [UseFormModalState, UseFormModalActions] => {
	const [isOpen, setIsOpen] = useState(false);
	const [isDirty, setIsDirty] = useState(false);
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<Record<string, any> | null>(initialData || null);

	const openModal = useCallback((newData?: Record<string, any>) => {
		setIsOpen(true);
		setIsDirty(false);
		setLoading(false);
		if (newData) {
			setData(newData);
		}
	}, []);

	const closeModal = useCallback(() => {
		setIsOpen(false);
		setIsDirty(false);
		setLoading(false);
	}, []);

	const handleSetDirty = useCallback((dirty: boolean) => {
		setIsDirty(dirty);
	}, []);

	const handleSetLoading = useCallback((isLoading: boolean) => {
		setLoading(isLoading);
	}, []);

	const handleSetData = useCallback((newData: Record<string, any>) => {
		setData(newData);
	}, []);

	const reset = useCallback(() => {
		setIsOpen(false);
		setIsDirty(false);
		setLoading(false);
		setData(initialData || null);
	}, [initialData]);

	return [
		{
			isOpen,
			isDirty,
			loading,
			data,
		},
		{
			openModal,
			closeModal,
			setDirty: handleSetDirty,
			setLoading: handleSetLoading,
			setData: handleSetData,
			reset,
		},
	];
};
