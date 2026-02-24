import { ReactNode, useCallback } from 'react';
import { Modal, Button, ModalProps } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import './FormModal.scss';

interface FormModalProps extends Omit<ModalProps, 'onOk' | 'onCancel' | 'footer'> {
	isOpen: boolean;
	title: string;
	isDirty?: boolean;
	onClose: () => void;
	onSubmit?: () => void | Promise<void>;
	children: ReactNode;
	okText?: string;
	cancelText?: string;
	loading?: boolean;
	confirmOnClose?: boolean;
}

function FormModal({
	isOpen,
	title,
	isDirty = false,
	onClose,
	onSubmit,
	okText = 'Save',
	cancelText = 'Cancel',
	loading = false,
	confirmOnClose = true,
	children,
	...modalProps
}: FormModalProps) {
	const handleCancel = useCallback(() => {
		if (isDirty && confirmOnClose) {
			Modal.confirm({
				title: 'Unsaved Changes',
				icon: <ExclamationCircleOutlined />,
				content: 'You have unsaved changes. Do you want to discard them?',
				okText: 'Discard',
				cancelText: 'Keep Editing',
				okType: 'danger',
				onOk() {
					onClose();
				},
			});
		} else {
			onClose();
		}
	}, [isDirty, confirmOnClose, onClose]);

	const handleSubmit = useCallback(async () => {
		if (onSubmit) {
			await onSubmit();
		}
	}, [onSubmit]);

	return (
		<Modal
			{...modalProps}
			style={{ top: 20, ...modalProps.style }}
			title={title}
			open={isOpen}
			onCancel={handleCancel}
			width={600}
			className='form-modal'
			footer={[
				<Button key='cancel' onClick={handleCancel} disabled={loading}>
					{cancelText}
				</Button>,
				onSubmit && (
					<Button key='submit' type='primary' onClick={handleSubmit} loading={loading}>
						{okText}
					</Button>
				),
			]}
		>
			{children}
		</Modal>
	);
}

export default FormModal;
