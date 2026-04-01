import { User, usersApi } from '@/api/users';
import DataTable from '@/components/datatable/DataTable';
import PageHeader from '@/components/page-header/PageHeader';
import { usePaginatedFetch } from '@/hooks/useFetch';
import UserModal from '@/pages/users/components/EditModal';
import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	DeleteOutlined,
	EditOutlined,
	KeyOutlined,
	LockOutlined,
	PlusOutlined,
	SearchOutlined,
	SyncOutlined,
	UnlockOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Button, Form, Input, Modal, Popconfirm, Select, Space, Tag, Tooltip, message } from 'antd';
import { TableColumnType } from 'antd';
import { useState } from 'react';

const roleColors: Record<string, string> = {
	admin: 'red',
	instructor: 'blue',
	student: 'green',
	reviewer: 'purple',
	guest: 'default',
};

const Users = () => {
	const [openEditModal, setOpenEditModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);

	const { data, pagination, loading, refetch, page, pageSize, setPage, setPageSize } = usePaginatedFetch<User>(
		`users-${search}-${roleFilter}`,
		(params) => usersApi.getUsers({ ...params, search: search || undefined, role: roleFilter }),
	);

	const handleEditUser = (user: User) => {
		setSelectedUser(user);
		setOpenEditModal(true);
	};

	const handleAddUser = () => {
		setSelectedUser(null);
		setOpenEditModal(true);
	};

	const handleDeleteUser = async (id: string) => {
		try {
			await usersApi.deleteUser(id);
			message.success('User deleted successfully');
			refetch();
		} catch (error) {
			console.error(error);
			message.error('Failed to delete user');
		}
	};

	const handleBlockUser = async (user: User) => {
		try {
			await usersApi.blockUser(user._id, {
				isBlocked: !user.isBlocked,
				reason: user.isBlocked ? undefined : 'Blocked by admin',
			});
			message.success(user.isBlocked ? 'User unblocked' : 'User blocked');
			refetch();
		} catch (error) {
			console.error(error);
			message.error('Failed to update user block status');
		}
	};

	const [resetPasswordModal, setResetPasswordModal] = useState<{ open: boolean; user: User | null }>({
		open: false,
		user: null,
	});
	const [resetLoading, setResetLoading] = useState(false);
	const [resetForm] = Form.useForm();

	const handleOpenResetPassword = (user: User) => {
		resetForm.resetFields();
		setResetPasswordModal({ open: true, user });
	};

	const handleResetPassword = async () => {
		try {
			const values = await resetForm.validateFields();
			setResetLoading(true);
			await usersApi.resetPassword(resetPasswordModal.user!._id, { newPassword: values.newPassword });
			message.success('Password reset successfully');
			setResetPasswordModal({ open: false, user: null });
		} catch (error: any) {
			console.error(error);
			message.error(error?.message || 'Failed to reset password');
		} finally {
			setResetLoading(false);
		}
	};

	const columns: TableColumnType<User>[] = [
		{
			title: 'Index',
			dataIndex: 'index',
			key: 'index',
			align: 'center' as const,
			width: 50,
			render: (_: any, __: any, index: number) => (page - 1) * pageSize + index + 1,
		},
		{
			title: 'Avatar',
			dataIndex: 'avatar',
			key: 'avatar',
			align: 'center' as const,
			fixed: 'left',
			width: 50,
			render: (url: string | undefined) =>
				url ? (
					<img
						src={url}
						alt='Avatar'
						style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
					/>
				) : (
					<div
						style={{
							borderRadius: '50%',
							background: '#ccc',
							width: 40,
							height: 40,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							margin: '0 auto',
						}}
					>
						<UserOutlined style={{ color: 'gray' }} />
					</div>
				),
		},
		{
			title: 'Name',
			dataIndex: 'name',
			align: 'center' as const,
			fixed: 'left',
			key: 'name',
			width: 140,
			render: (text: string) => <strong>{text}</strong>,
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			width: 140,
			align: 'center' as const,
			render: (text: string) => <span>{text}</span>,
		},
		{
			title: 'Role',
			dataIndex: 'role',
			key: 'role',
			width: 90,
			align: 'center' as const,
			render: (text: string) => <Tag color={roleColors[text] || 'default'}>{text?.toUpperCase()}</Tag>,
		},
		{
			title: 'Active',
			dataIndex: 'isActive',
			key: 'isActive',
			width: 60,
			align: 'center' as const,
			render: (isActive: boolean) => (
				<span>
					{isActive ? (
						<CheckCircleOutlined style={{ color: 'green' }} />
					) : (
						<CloseCircleOutlined style={{ color: 'red' }} />
					)}
				</span>
			),
		},
		{
			title: 'Created At',
			dataIndex: 'createdAt',
			key: 'createdAt',
			align: 'center' as const,
			width: 90,
			render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
		},
		{
			title: 'Updated At',
			dataIndex: 'updatedAt',
			key: 'updatedAt',
			align: 'center' as const,
			width: 90,
			render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
		},
		{
			title: 'Actions',
			key: 'actions',
			align: 'center' as const,
			fixed: 'right',
			width: 150,
			render: (user: User) => (
				<Space onClick={(e) => e.stopPropagation()}>
					<Tooltip title='Edit'>
						<Button type='text' icon={<EditOutlined />} size='small' onClick={() => handleEditUser(user)} />
					</Tooltip>
					<Tooltip title={user.isBlocked ? 'Unblock' : 'Block'}>
						<Popconfirm
							title={user.isBlocked ? 'Unblock this user?' : 'Block this user?'}
							description={user.isBlocked ? 'User will regain access.' : 'User will lose access.'}
							onConfirm={() => handleBlockUser(user)}
							okText='Yes'
							cancelText='No'
							okButtonProps={{ danger: !user.isBlocked }}
						>
							<Button
								type='text'
								size='small'
								icon={
									user.isBlocked ? (
										<UnlockOutlined style={{ color: '#52c41a' }} />
									) : (
										<LockOutlined style={{ color: '#fa8c16' }} />
									)
								}
							/>
						</Popconfirm>
					</Tooltip>
					<Tooltip title='Reset Password'>
						<Button
							type='text'
							size='small'
							icon={<KeyOutlined style={{ color: '#722ed1' }} />}
							onClick={() => handleOpenResetPassword(user)}
						/>
					</Tooltip>
					<Popconfirm
						title='Delete User'
						description='Are you sure you want to delete this user?'
						onConfirm={() => handleDeleteUser(user._id)}
						okText='Yes'
						cancelText='No'
						okButtonProps={{ danger: true }}
					>
						<Button type='text' danger icon={<DeleteOutlined />} size='small' />
					</Popconfirm>
				</Space>
			),
		},
	];

	const handleSearch = () => {
		setSearch(searchInput);
		setPage(1);
	};

	const pageActions = (
		<Space wrap>
			<Input
				placeholder='Search name or email...'
				value={searchInput}
				onChange={(e) => setSearchInput(e.target.value)}
				onPressEnter={handleSearch}
				style={{ width: 220 }}
				suffix={<SearchOutlined style={{ color: '#aaa', cursor: 'pointer' }} onClick={handleSearch} />}
			/>
			<Select
				placeholder='All roles'
				allowClear
				style={{ width: 140 }}
				value={roleFilter}
				onChange={(val) => { setRoleFilter(val); setPage(1); }}
				options={[
					{ value: 'admin', label: 'Admin' },
					{ value: 'instructor', label: 'Instructor' },
					{ value: 'student', label: 'Student' },
					{ value: 'reviewer', label: 'Reviewer' },
				]}
			/>
			<Button icon={<SyncOutlined />} onClick={() => refetch()}>Refresh</Button>
			<Button icon={<PlusOutlined />} type='primary' onClick={handleAddUser}>
				Add User
			</Button>
		</Space>
	);
	return (
		<div>
			<PageHeader title='Users' total={pagination?.total} actions={pageActions} />

			<DataTable
				scroll={{ x: 1800 }}
				columns={columns}
				dataSource={data || []}
				loading={loading}
				rowKey='_id'
				pagination={{
					current: page,
					pageSize: pageSize,
					total: pagination?.total || 0,
				}}
				tableLayout='fixed'
				onChange={(p) => {
					setPage(p.current || 1);
					setPageSize(p.pageSize || 10);
				}}
				onRow={(record) => ({
					onClick: () => handleEditUser(record),
					style: { cursor: 'pointer' },
				})}
			/>

			<UserModal
				open={openEditModal}
				onCancel={() => setOpenEditModal(false)}
				selectedUser={selectedUser}
				onSuccess={refetch}
			/>

			{/* Reset Password Modal */}
			<Modal
				open={resetPasswordModal.open}
				title={`🔑 Reset Password — ${resetPasswordModal.user?.name}`}
				onCancel={() => setResetPasswordModal({ open: false, user: null })}
				onOk={handleResetPassword}
				confirmLoading={resetLoading}
				okText='Reset Password'
				okButtonProps={{ danger: true }}
				style={{ top: 20 }}
			>
				<p style={{ color: '#6b7280', marginBottom: 16 }}>
					Set a new password for <strong>{resetPasswordModal.user?.email}</strong>
				</p>
				<Form form={resetForm} layout='vertical'>
					<Form.Item
						name='newPassword'
						label='New Password'
						rules={[
							{ required: true, message: 'Please enter new password' },
							{ min: 6, message: 'Password must be at least 6 characters' },
						]}
					>
						<Input.Password placeholder='Enter new password' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default Users;
