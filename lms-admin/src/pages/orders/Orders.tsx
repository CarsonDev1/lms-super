import { ordersApi, Order } from '@/api/orders';
import DataTable from '@/components/datatable/DataTable';
import PageHeader from '@/components/page-header/PageHeader';
import { usePaginatedFetch } from '@/hooks/useFetch';
import {
	SearchOutlined,
	ShoppingOutlined,
	SyncOutlined,
} from '@ant-design/icons';
import {
	Avatar,
	Button,
	Descriptions,
	Drawer,
	Input,
	Select,
	Space,
	Tag,
	Tooltip,
	Typography,
} from 'antd';
import { TableColumnType } from 'antd';
import { useState } from 'react';

const { Text } = Typography;

const statusColor: Record<string, string> = {
	pending: 'warning',
	processing: 'processing',
	completed: 'success',
	failed: 'error',
	refunded: 'purple',
	cancelled: 'default',
};

const methodColor: Record<string, string> = {
	sepay: 'purple',
	vietqr: 'blue',
	manual: 'green',
};

const Orders = () => {
	const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
	const [search, setSearch] = useState('');
	const [searchInput, setSearchInput] = useState('');
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const { data, pagination, loading, refetch, page, pageSize, setPage, setPageSize } =
		usePaginatedFetch<Order>(
			`orders-${statusFilter}-${search}`,
			(params) => ordersApi.getAllOrders({ ...params, status: statusFilter, search }),
			undefined,
			1,
			20,
		);

	const handleSearch = () => {
		setSearch(searchInput);
	};

	const handleViewDetail = (order: Order) => {
		setSelectedOrder(order);
		setDrawerOpen(true);
	};

	const columns: TableColumnType<Order>[] = [
		{
			title: '#',
			key: 'index',
			align: 'center',
			width: 55,
			render: (_: any, __: any, i: number) => (page - 1) * pageSize + i + 1,
		},
		{
			title: 'Student',
			key: 'user',
			width: 200,
			fixed: 'left',
			render: (_: any, record: Order) => (
				<Space>
					<Avatar src={record.userId?.avatar} size={32} style={{ background: '#1890ff' }}>
						{record.userId?.name?.[0]}
					</Avatar>
					<div>
						<div style={{ fontWeight: 600, fontSize: 13 }}>{record.userId?.name}</div>
						<Text type='secondary' style={{ fontSize: 11 }}>
							{record.userId?.email}
						</Text>
					</div>
				</Space>
			),
		},
		{
			title: 'Course',
			key: 'course',
			width: 220,
			render: (_: any, record: Order) => (
				<Space>
					{record.courseId?.thumbnail ? (
						<img
							src={record.courseId.thumbnail}
							style={{ width: 40, height: 28, objectFit: 'cover', borderRadius: 4 }}
							alt=''
						/>
					) : (
						<div
							style={{
								width: 40,
								height: 28,
								background: '#f0f0f0',
								borderRadius: 4,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<ShoppingOutlined style={{ color: '#aaa' }} />
						</div>
					)}
					<Text style={{ fontSize: 13, fontWeight: 500 }}>{record.courseId?.title}</Text>
				</Space>
			),
		},
		{
			title: 'Amount',
			key: 'amount',
			align: 'right',
			width: 120,
			render: (_: any, record: Order) => (
				<div>
					<div style={{ fontWeight: 700, color: '#52c41a', fontSize: 14 }}>
						{record.amount.toLocaleString('vi-VN')}₫
					</div>
					{record.discountAmount > 0 && (
						<Text type='secondary' style={{ fontSize: 11 }}>
							Discount: -{record.discountAmount.toLocaleString('vi-VN')}₫
						</Text>
					)}
				</div>
			),
		},
		{
			title: 'Method',
			dataIndex: 'paymentMethod',
			key: 'method',
			align: 'center',
			width: 90,
			render: (m: string) => (
				<Tag color={methodColor[m] || 'default'}>{m?.toUpperCase()}</Tag>
			),
		},
		{
			title: 'Status',
			dataIndex: 'paymentStatus',
			key: 'status',
			align: 'center',
			width: 110,
			render: (s: string) => (
				<Tag color={statusColor[s] || 'default'}>{s?.toUpperCase()}</Tag>
			),
		},
		{
			title: 'Transaction ID',
			dataIndex: 'transactionId',
			key: 'txn',
			width: 180,
			render: (t: string) => (
				<Text code style={{ fontSize: 11 }}>
					{t || '—'}
				</Text>
			),
		},
		{
			title: 'Date',
			dataIndex: 'createdAt',
			key: 'date',
			align: 'center',
			width: 110,
			render: (d: string) => new Date(d).toLocaleDateString('vi-VN'),
		},
		{
			title: 'Actions',
			key: 'actions',
			align: 'center',
			width: 80,
			fixed: 'right',
			render: (_: any, record: Order) => (
				<Tooltip title='View Details'>
					<Button
						type='text'
						size='small'
						icon={<SearchOutlined />}
						onClick={(e) => { e.stopPropagation(); handleViewDetail(record); }}
					/>
				</Tooltip>
			),
		},
	];

	return (
		<div>
			<PageHeader
				title='Orders'
				total={pagination?.total}
				actions={
					<Space wrap>
						<Input
							placeholder='Search transaction ID...'
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							onPressEnter={handleSearch}
							style={{ width: 220 }}
							suffix={<SearchOutlined style={{ color: '#aaa', cursor: 'pointer' }} onClick={handleSearch} />}
						/>
						<Select
							placeholder='All statuses'
							allowClear
							style={{ width: 150 }}
							value={statusFilter}
							onChange={(val) => { setStatusFilter(val); setPage(1); }}
							options={[
								{ value: 'pending', label: 'Pending' },
								{ value: 'processing', label: 'Processing' },
								{ value: 'completed', label: 'Completed' },
								{ value: 'failed', label: 'Failed' },
								{ value: 'refunded', label: 'Refunded' },
								{ value: 'cancelled', label: 'Cancelled' },
							]}
						/>
						<Button icon={<SyncOutlined />} onClick={() => refetch()}>
							Refresh
						</Button>
					</Space>
				}
			/>

			<DataTable
				scroll={{ x: 1200 }}
				columns={columns}
				dataSource={data || []}
				loading={loading}
				rowKey='_id'
				tableLayout='fixed'
				pagination={{ current: page, pageSize, total: pagination?.total || 0 }}
				onChange={(p) => { setPage(p.current || 1); setPageSize(p.pageSize || 20); }}
				onRow={(record) => ({
					onClick: () => handleViewDetail(record),
					style: { cursor: 'pointer' },
				})}
			/>

			{/* Order Detail Drawer */}
			<Drawer
				title={
					<Space>
						<ShoppingOutlined style={{ color: '#1890ff' }} />
						Order Details
					</Space>
				}
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				width={520}
			>
				{selectedOrder && (
					<Descriptions bordered column={1} size='small'>
						<Descriptions.Item label='Transaction ID'>
							<Text code>{selectedOrder.transactionId || '—'}</Text>
						</Descriptions.Item>
						<Descriptions.Item label='Student'>
							<Space>
								<Avatar src={selectedOrder.userId?.avatar} size={24}>
									{selectedOrder.userId?.name?.[0]}
								</Avatar>
								<div>
									<div style={{ fontWeight: 600 }}>{selectedOrder.userId?.name}</div>
									<Text type='secondary' style={{ fontSize: 12 }}>
										{selectedOrder.userId?.email}
									</Text>
								</div>
							</Space>
						</Descriptions.Item>
						<Descriptions.Item label='Course'>
							{selectedOrder.courseId?.title}
						</Descriptions.Item>
						<Descriptions.Item label='Original Amount'>
							{selectedOrder.originalAmount.toLocaleString('vi-VN')}₫
						</Descriptions.Item>
						<Descriptions.Item label='Discount'>
							{selectedOrder.discountAmount.toLocaleString('vi-VN')}₫
							{selectedOrder.couponCode && (
								<Tag style={{ marginLeft: 8 }}>{selectedOrder.couponCode}</Tag>
							)}
						</Descriptions.Item>
						<Descriptions.Item label='Final Amount'>
							<strong style={{ color: '#52c41a', fontSize: 16 }}>
								{selectedOrder.amount.toLocaleString('vi-VN')}₫
							</strong>
						</Descriptions.Item>
						<Descriptions.Item label='Payment Method'>
							<Tag color={methodColor[selectedOrder.paymentMethod]}>
								{selectedOrder.paymentMethod?.toUpperCase()}
							</Tag>
						</Descriptions.Item>
						<Descriptions.Item label='Status'>
							<Tag color={statusColor[selectedOrder.paymentStatus]}>
								{selectedOrder.paymentStatus?.toUpperCase()}
							</Tag>
						</Descriptions.Item>
						<Descriptions.Item label='Created At'>
							{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
						</Descriptions.Item>
						{selectedOrder.completedAt && (
							<Descriptions.Item label='Completed At'>
								{new Date(selectedOrder.completedAt).toLocaleString('vi-VN')}
							</Descriptions.Item>
						)}
					</Descriptions>
				)}
			</Drawer>
		</div>
	);
};

export default Orders;
