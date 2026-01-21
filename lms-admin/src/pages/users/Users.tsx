import { User, usersApi } from '@/api/users';
import DataTable from '@/components/datatable/DataTable';
import PageHeader from '@/components/page-header/PageHeader';
import { useFetch } from '@/hooks/useFetch';
import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	DeleteOutlined,
	EditOutlined,
	MinusCircleOutlined,
	PlusOutlined,
} from '@ant-design/icons';
import { Button, Image, Popconfirm, Space, Tooltip } from 'antd';
import { useState } from 'react';

const Users = () => {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const { data, pagination, loading, error, refetch } = useFetch<User>(
		'users',
		() => usersApi.getUsers({ page, limit: pageSize }),
		undefined,
		[page, pageSize],
	);

	const columns = [
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
			width: 50,
			render: (url: string | undefined) =>
				url ? (
					<Image preview src={url} alt='Avatar' style={{ width: 40, height: 40, borderRadius: '50%' }} />
				) : (
					'N/A'
				),
		},
		{
			title: 'Name',
			dataIndex: 'name',
			align: 'center' as const,
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
			render: () => (
				<Space>
					<Button type='text' icon={<EditOutlined />} size='small' onClick={() => {}} />
					<Popconfirm
						title='Delete User'
						description='Are you sure you want to delete this user?'
						onConfirm={() => {}}
						okText='Yes'
						cancelText='No'
						okButtonProps={{ danger: true }}
					>
						<Button type='text' danger icon={<DeleteOutlined />} size='small' />
					</Popconfirm>
					<Tooltip title='Deactivate User'>
						<Button type='text' danger icon={<MinusCircleOutlined />} size='small' />
					</Tooltip>
				</Space>
			),
		},
	];

	const pageActions = (
		<div className='actions'>
			<Button onClick={() => refetch()}>Refresh</Button>
			<Button icon={<PlusOutlined />} type='primary' className='btn-primary' onClick={() => {}}>
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
				onChange={() => {}}
			/>
		</div>
	);
};

export default Users;
