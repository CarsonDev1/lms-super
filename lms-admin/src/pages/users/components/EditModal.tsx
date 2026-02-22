import { User, usersApi } from '@/api/users';
import { FormModal } from '@/components/modal';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Input, Select, Spin, Switch, Upload, message } from 'antd';
import { useEffect, useState } from 'react';
import './EditModal.scss';
import { uploadApi } from '@/api/upload';

interface EditModalProps {
	open: boolean;
	onCancel: () => void;
	selectedUser: User | null;
	onSuccess: () => void;
}

const EditModal = ({ open, onCancel, selectedUser, onSuccess }: EditModalProps) => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (open) {
			if (selectedUser) {
				form.setFieldsValue({
					name: selectedUser.name,
					email: selectedUser.email,
					role: selectedUser.role,
					isActive: selectedUser.isActive,
				});
			} else {
				form.resetFields();
				// Default values for create
				form.setFieldsValue({
					isActive: true,
					role: 'user',
				});
			}
		}
	}, [open, selectedUser, form]);

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);
			if (selectedUser?._id) {
				await usersApi.updateUser(selectedUser._id, values);
				message.success('User updated successfully');
			} else {
				await usersApi.createUser(values);
				message.success('User created successfully');
			}
			onSuccess();
			onCancel();
		} catch (error) {
			console.error(error);
			message.error(selectedUser ? 'Failed to update user' : 'Failed to create user');
		} finally {
			setLoading(false);
		}
	};

	const handleCustomUpload = async ({ file, onSuccess, onError }: any) => {
		try {
			const res = await uploadApi.uploadImage(file);
			onSuccess(res.data, file);
		} catch (err) {
			onError(err);
		}
	};

	const handleBeforeUpload = () => {
		setLoading(true);
		return true;
	};

	const handleUploadChange = async (info: any) => {
		if (info.file.status === 'done') {
			const response = info.file.response;
			if (response && response.url) {
				form.setFieldsValue({ avatar: response.url });
				message.success('Avatar uploaded successfully');
			} else {
				message.error('Failed to upload avatar');
			}
			setLoading(false);
		} else if (info.file.status === 'error') {
			message.error('Failed to upload avatar');
			setLoading(false);
		} else if (info.file.status !== 'uploading') {
			setLoading(false);
		}
	};

	return (
		<FormModal
			isOpen={open}
			onClose={onCancel}
			title={selectedUser ? 'Edit User' : 'Add User'}
			onSubmit={handleSubmit}
			loading={loading}
			isDirty={form.isFieldsTouched()}
		>
			<Form form={form} layout='vertical'>
				<Form.Item name='avatar' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
					<Upload
						style={{ borderRadius: '50%' }}
						name='image'
						listType='picture-card'
						className='avatar-uploader'
						showUploadList={false}
						action='/admin/upload/image'
						headers={{ 'Content-Type': 'multipart/form-data' }}
						beforeUpload={handleBeforeUpload}
						onChange={handleUploadChange}
						customRequest={handleCustomUpload}
					>
						{loading ? (
							<div className='avatar-wrapper'>
								<div
									className='avatar-loading-spinner'
									style={{
										width: 80,
										height: 80,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<Spin />
								</div>
							</div>
						) : form.getFieldValue('avatar') || selectedUser?.avatar ? (
							<div className='avatar-wrapper'>
								<img src={form.getFieldValue('avatar') || selectedUser?.avatar} alt='avatar' />
								<div className='avatar-overlay'>
									<EditOutlined />
								</div>
							</div>
						) : (
							<PlusOutlined />
						)}
					</Upload>
				</Form.Item>
				<Form.Item name='name' label='Name' rules={[{ required: true, message: 'Please enter name' }]}>
					<Input />
				</Form.Item>
				{!selectedUser && (
					<Form.Item
						name='password'
						label='Password'
						rules={[{ required: selectedUser ? false : true, message: 'Please enter password' }]}
					>
						<Input.Password />
					</Form.Item>
				)}
				<Form.Item
					name='email'
					label='Email'
					rules={[
						{ required: true, message: 'Please enter email' },
						{ type: 'email', message: 'Invalid email' },
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item name='role' label='Role' rules={[{ required: true, message: 'Please select role' }]}>
					<Select>
						<Select.Option value='user'>User</Select.Option>
						<Select.Option value='admin'>Admin</Select.Option>
					</Select>
				</Form.Item>
				<Form.Item name='isActive' label='Active' valuePropName='checked'>
					<Switch />
				</Form.Item>
			</Form>
		</FormModal>
	);
};

export default EditModal;
