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
	PlusOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Button, Popconfirm, Space, message } from 'antd';
import { TableColumnType } from 'antd';
import { useState } from 'react';

const Users = () => {
	const [openEditModal, setOpenEditModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const { data, pagination, loading, refetch, page, pageSize, setPage, setPageSize } = usePaginatedFetch<User>(
		'users',
		(params) => usersApi.getUsers(params),
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
			width: 60,
			align: 'center' as const,
			render: (text: string) => <span>{text}</span>,
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
			width: 150,
			render: (user: User) => (
				<Space>
					<Button type='text' icon={<EditOutlined />} size='small' onClick={() => handleEditUser(user)} />
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

	const pageActions = (
		<div className='actions'>
			<Button onClick={() => refetch()}>Refresh</Button>
			<Button icon={<PlusOutlined />} type='primary' className='btn-primary' onClick={handleAddUser}>
				Add User
			</Button>
		</div>
	);
	return (
		<div>
			<PageHeader title='List user' total={pagination?.total} actions={pageActions} />

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
			/>

			<UserModal
				open={openEditModal}
				onCancel={() => setOpenEditModal(false)}
				selectedUser={selectedUser}
				onSuccess={refetch}
			/>
		</div>
	);
};

export default Users;
