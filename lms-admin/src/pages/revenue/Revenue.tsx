import { revenueApi } from '@/api/revenue';
import PageHeader from '@/components/page-header/PageHeader';
import { BarChartOutlined, DollarOutlined, ShoppingOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Row, Spin, Table, Tag, Typography, message } from 'antd';
import { TableColumnType } from 'antd';
import { useEffect, useState } from 'react';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

interface RevenueReportData {
	byPaymentMethod: { _id: string; revenue: number; orders: number }[];
	byInstructor: {
		_id: string;
		instructor: { name: string; email: string };
		revenue: number;
		orders: number;
	}[];
	daily: { _id: { year: number; month: number; day: number }; revenue: number; orders: number }[];
}

const StatCard = ({
	icon,
	title,
	value,
	color,
}: {
	icon: React.ReactNode;
	title: string;
	value: string | number;
	color: string;
}) => (
	<Card style={{ borderRadius: 12, border: '1px solid #f0f0f0' }}>
		<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
			<div
				style={{
					width: 48,
					height: 48,
					borderRadius: 12,
					background: color,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: 22,
					color: '#fff',
					flexShrink: 0,
				}}
			>
				{icon}
			</div>
			<div>
				<Text style={{ color: '#6b7280', fontSize: 13 }}>{title}</Text>
				<Title level={4} style={{ margin: 0 }}>
					{value}
				</Title>
			</div>
		</div>
	</Card>
);

const Revenue = () => {
	const [data, setData] = useState<RevenueReportData | null>(null);
	const [loading, setLoading] = useState(false);
	const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

	const fetchData = async () => {
		setLoading(true);
		try {
			const params: any = {};
			if (dateRange?.[0]) params.startDate = dateRange[0].startOf('day').toISOString();
			if (dateRange?.[1]) params.endDate = dateRange[1].endOf('day').toISOString();

			const res: any = await revenueApi.getRevenueReport(params);
			setData(res?.data || res || null);
		} catch {
			message.error('Failed to load revenue report');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ─── Summary stats ───────────────────────────────────────────────────────────
	const totalRevenue = data?.byPaymentMethod.reduce((sum, r) => sum + r.revenue, 0) ?? 0;
	const totalOrders = data?.byPaymentMethod.reduce((sum, r) => sum + r.orders, 0) ?? 0;
	const topInstructor = data?.byInstructor[0];

	// ─── Table: by payment method ────────────────────────────────────────────────
	const paymentCols: TableColumnType<any>[] = [
		{
			title: 'Payment Method',
			dataIndex: '_id',
			key: 'method',
			render: (v: string) => (
				<Tag color={v === 'vietqr' ? 'blue' : v === 'sepay' ? 'purple' : 'green'}>
					{v?.toUpperCase() || 'UNKNOWN'}
				</Tag>
			),
		},
		{
			title: 'Orders',
			dataIndex: 'orders',
			key: 'orders',
			align: 'center',
		},
		{
			title: 'Revenue',
			dataIndex: 'revenue',
			key: 'revenue',
			align: 'right',
			render: (v: number) => <strong style={{ color: '#52c41a' }}>${v.toLocaleString()}</strong>,
		},
	];

	// ─── Table: top instructors ──────────────────────────────────────────────────
	const instructorCols: TableColumnType<any>[] = [
		{
			title: '#',
			key: 'rank',
			align: 'center',
			width: 50,
			render: (_: any, __: any, index: number) => index + 1,
		},
		{
			title: 'Instructor',
			key: 'name',
			render: (_: any, record: any) => (
				<div>
					<div style={{ fontWeight: 600 }}>{record.instructor?.name || '—'}</div>
					<Text type='secondary' style={{ fontSize: 12 }}>
						{record.instructor?.email}
					</Text>
				</div>
			),
		},
		{
			title: 'Orders',
			dataIndex: 'orders',
			key: 'orders',
			align: 'center',
			width: 80,
		},
		{
			title: 'Revenue',
			dataIndex: 'revenue',
			key: 'revenue',
			align: 'right',
			render: (v: number) => <strong style={{ color: '#52c41a' }}>${v.toLocaleString()}</strong>,
		},
	];

	// ─── Table: daily ────────────────────────────────────────────────────────────
	const dailyCols: TableColumnType<any>[] = [
		{
			title: 'Date',
			key: 'date',
			render: (_: any, record: any) =>
				`${record._id.year}-${String(record._id.month).padStart(2, '0')}-${String(record._id.day).padStart(2, '0')}`,
		},
		{
			title: 'Orders',
			dataIndex: 'orders',
			key: 'orders',
			align: 'center',
			width: 90,
		},
		{
			title: 'Revenue',
			dataIndex: 'revenue',
			key: 'revenue',
			align: 'right',
			render: (v: number) => <strong style={{ color: '#52c41a' }}>${v.toLocaleString()}</strong>,
		},
	];

	return (
		<div>
			<PageHeader
				title='Revenue Report'
				actions={
					<div className='actions' style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
						<RangePicker
							value={dateRange}
							onChange={(range) => setDateRange(range as any)}
							format='DD/MM/YYYY'
						/>
						<Button type='primary' icon={<BarChartOutlined />} onClick={fetchData}>
							Apply
						</Button>
					</div>
				}
			/>

			{loading ? (
				<div style={{ textAlign: 'center', padding: 80 }}>
					<Spin size='large' />
				</div>
			) : (
				<>
					{/* Summary cards */}
					<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
						<Col xs={24} sm={12} md={8}>
							<StatCard
								icon={<DollarOutlined />}
								title='Total Revenue'
								value={`$${totalRevenue.toLocaleString()}`}
								color='#52c41a'
							/>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<StatCard
								icon={<ShoppingOutlined />}
								title='Total Orders'
								value={totalOrders}
								color='#1890ff'
							/>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<StatCard
								icon={<UserOutlined />}
								title='Top Instructor'
								value={topInstructor?.instructor?.name || '—'}
								color='#722ed1'
							/>
						</Col>
					</Row>

					<Row gutter={[16, 16]}>
						{/* By Payment Method */}
						<Col xs={24} md={10}>
							<Card
								title='By Payment Method'
								style={{ borderRadius: 12 }}
								bodyStyle={{ padding: '0 0 16px' }}
							>
								<Table
									dataSource={data?.byPaymentMethod || []}
									columns={paymentCols}
									rowKey='_id'
									pagination={false}
									size='small'
								/>
							</Card>
						</Col>

						{/* Top Instructors */}
						<Col xs={24} md={14}>
							<Card
								title='Top Instructors by Revenue'
								style={{ borderRadius: 12 }}
								bodyStyle={{ padding: '0 0 16px' }}
							>
								<Table
									dataSource={data?.byInstructor || []}
									columns={instructorCols}
									rowKey='_id'
									pagination={{ pageSize: 8, size: 'small', showSizeChanger: false }}
									size='small'
								/>
							</Card>
						</Col>

						{/* Daily revenue */}
						<Col xs={24}>
							<Card
								title='Daily Revenue'
								style={{ borderRadius: 12 }}
								bodyStyle={{ padding: '0 0 16px' }}
							>
								<Table
									dataSource={[...(data?.daily || [])].reverse()}
									columns={dailyCols}
									rowKey={(r) => `${r._id.year}-${r._id.month}-${r._id.day}`}
									pagination={{ pageSize: 14, size: 'small', showSizeChanger: false }}
									size='small'
								/>
							</Card>
						</Col>
					</Row>
				</>
			)}
		</div>
	);
};

export default Revenue;
