import { useEffect, useState } from 'react';
import {
	Row, Col, Card, Statistic, Typography, Spin, Alert, Tag, Table, Progress, Space,
} from 'antd';
import {
	BookOutlined, DollarOutlined, UserOutlined, StarOutlined,
	RiseOutlined, CheckCircleOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { instructorApi } from '@/api/instructor';

const { Title, Text } = Typography;

function InstructorHome() {
	const [dashboard, setDashboard] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchDashboard = async () => {
			try {
				setLoading(true);
				const res = await instructorApi.getDashboard();
				setDashboard(res);
			} catch (err: any) {
				setError(err?.message || 'Failed to load dashboard');
			} finally {
				setLoading(false);
			}
		};
		fetchDashboard();
	}, []);

	const d = dashboard?.data || dashboard || {};

	const stats = [
		{
			title: 'My Courses',
			value: d?.courses?.total ?? 0,
			icon: <BookOutlined />,
			color: '#1890ff',
			bg: '#e6f4ff',
			sub: (
				<Space wrap style={{ marginTop: 6 }}>
					<Tag color='success'>Published: {d?.courses?.published ?? 0}</Tag>
					<Tag color='warning'>Pending: {d?.courses?.pending ?? 0}</Tag>
					<Tag color='default'>Draft: {d?.courses?.draft ?? 0}</Tag>
				</Space>
			),
		},
		{
			title: 'Total Students',
			value: d?.enrollments?.total ?? 0,
			icon: <UserOutlined />,
			color: '#52c41a',
			bg: '#f6ffed',
			sub: (
				<Tag color='blue' style={{ marginTop: 6 }}>
					Active: {d?.enrollments?.active ?? 0}
				</Tag>
			),
		},
		{
			title: 'Total Revenue',
			value: d?.revenue?.totalRevenue ?? 0,
			icon: <DollarOutlined />,
			color: '#fa8c16',
			bg: '#fff7e6',
			sub: (
				<Tag color='green' icon={<RiseOutlined />} style={{ marginTop: 6 }}>
					{d?.revenue?.totalOrders ?? 0} orders
				</Tag>
			),
		},
		{
			title: 'Average Rating',
			value: Number((d?.reviews?.averageRating ?? 0).toFixed(1)),
			icon: <StarOutlined />,
			color: '#faad14',
			bg: '#fffbe6',
			precision: 1,
			sub: (
				<Tag style={{ marginTop: 6 }}>{d?.reviews?.totalReviews ?? 0} reviews</Tag>
			),
		},
	];

	// Course performance columns
	const performanceCols = [
		{
			title: 'Course',
			key: 'course',
			render: (_: any, r: any) => (
				<Space>
					{r.thumbnail && (
						<img src={r.thumbnail} style={{ width: 36, height: 26, objectFit: 'cover', borderRadius: 4 }} alt='' />
					)}
					<Text style={{ fontSize: 13, fontWeight: 600 }}>{r.title}</Text>
				</Space>
			),
		},
		{
			title: 'Students',
			dataIndex: 'enrollmentCount',
			key: 'students',
			align: 'center' as const,
			width: 90,
			render: (v: number) => <Tag color='blue'>{v ?? 0}</Tag>,
		},
		{
			title: 'Rating',
			key: 'rating',
			align: 'center' as const,
			width: 100,
			render: (_: any, r: any) =>
				r.averageRating > 0 ? (
					<Tag color='gold'>⭐ {Number(r.averageRating).toFixed(1)}</Tag>
				) : (
					<Text type='secondary'>—</Text>
				),
		},
		{
			title: 'Reviews',
			dataIndex: 'totalReviews',
			key: 'reviews',
			align: 'center' as const,
			width: 80,
			render: (v: number) => v ?? 0,
		},
	];

	return (
		<div>
			<Title level={2} style={{ marginBottom: 24, fontWeight: 700 }}>
				Instructor Dashboard
			</Title>

			{error && <Alert type='error' message={error} style={{ marginBottom: 16 }} />}

			{loading ? (
				<div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
					<Spin size='large' />
				</div>
			) : (
				<>
					{/* ── Stat Cards ── */}
					<Row gutter={[20, 20]}>
						{stats.map((s) => (
							<Col xs={24} sm={12} xl={6} key={s.title}>
								<Card
									style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}
									styles={{ body: { padding: '20px 24px' } }}
								>
									<div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
										<div style={{ flex: 1, minWidth: 0 }}>
											<p style={{ color: '#6b7280', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>{s.title}</p>
											<Statistic
												value={s.value}
												precision={s.precision ?? 0}
												valueStyle={{ color: s.color, fontSize: 26, fontWeight: 700 }}
											/>
											{s.sub}
										</div>
										<div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: s.color, flexShrink: 0 }}>
											{s.icon}
										</div>
									</div>
								</Card>
							</Col>
						))}
					</Row>

					{/* ── Engagement Row ── */}
					<Row gutter={[20, 20]} style={{ marginTop: 20 }}>
						<Col xs={24} md={10}>
							<Card
								title={<span style={{ fontWeight: 700 }}>Engagement Overview</span>}
								style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', height: '100%' }}
								styles={{ body: { padding: '16px 20px' } }}
							>
								{[
									{
										label: 'Avg Progress',
										value: Math.round(d?.engagement?.averageProgress ?? 0),
										color: '#1890ff',
										icon: <ClockCircleOutlined />,
									},
									{
										label: 'Completion Rate',
										value: Math.round(d?.engagement?.completionRate ?? 0),
										color: '#52c41a',
										icon: <CheckCircleOutlined />,
									},
								].map((item) => (
									<div key={item.label} style={{ marginBottom: 18 }}>
										<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
											<Space>
												<span style={{ color: item.color }}>{item.icon}</span>
												<Text style={{ fontSize: 13 }}>{item.label}</Text>
											</Space>
											<Text style={{ fontWeight: 700, color: item.color }}>{item.value}%</Text>
										</div>
										<Progress
											percent={item.value}
											strokeColor={item.color}
											showInfo={false}
											size='small'
											trailColor='#f0f0f0'
										/>
									</div>
								))}
							</Card>
						</Col>

						<Col xs={24} md={14}>
							<Card
								title={<span style={{ fontWeight: 700 }}>Course Performance</span>}
								style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
								styles={{ body: { padding: 0 } }}
							>
								<Table
									dataSource={d?.coursePerformance || []}
									columns={performanceCols}
									rowKey='_id'
									pagination={{ pageSize: 5, size: 'small', showSizeChanger: false }}
									size='small'
									scroll={{ x: 400 }}
								/>
							</Card>
						</Col>
					</Row>
				</>
			)}
		</div>
	);
}

export default InstructorHome;
