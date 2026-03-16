import { useEffect, useState } from 'react';
import {
	Row, Col, Card, Statistic, Typography, Spin, Alert, Table, Tag, Avatar, Space, Progress,
} from 'antd';
import {
	UserOutlined, BookOutlined, ShoppingOutlined, DollarOutlined,
	CheckCircleOutlined, TeamOutlined, RiseOutlined,
} from '@ant-design/icons';
import { adminApi } from '@/api/admin';
import './Home.scss';

const { Title, Text } = Typography;

// ─── Tiny SVG Sparkline ───────────────────────────────────────────────────────
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
	if (!data || data.length < 2) return null;
	const max = Math.max(...data, 1);
	const w = 120, h = 40, pad = 4;
	const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (w - pad * 2));
	const ys = data.map((v) => h - pad - ((v / max) * (h - pad * 2)));
	const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' ');
	const fillPts = `${xs[0]},${h} ${pts} ${xs[xs.length - 1]},${h}`;
	return (
		<svg width={w} height={h} style={{ overflow: 'visible' }}>
			<defs>
				<linearGradient id={`grad-${color.replace('#', '')}`} x1='0' y1='0' x2='0' y2='1'>
					<stop offset='0%' stopColor={color} stopOpacity={0.3} />
					<stop offset='100%' stopColor={color} stopOpacity={0.01} />
				</linearGradient>
			</defs>
			<polygon points={fillPts} fill={`url(#grad-${color.replace('#', '')})`} />
			<polyline points={pts} fill='none' stroke={color} strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' />
			<circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r={3} fill={color} />
		</svg>
	);
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
	title, value, icon, color, bg, prefix, precision, sparkData, subText,
}: {
	title: string; value: number; icon: React.ReactNode; color: string; bg: string;
	prefix?: string; precision?: number; sparkData?: number[]; subText?: string;
}) => (
	<Card
		style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.05)', height: '100%' }}
		styles={{ body: { padding: '20px 24px' } }}
	>
		<div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
			<div style={{ flex: 1, minWidth: 0 }}>
				<p style={{ color: '#6b7280', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>{title}</p>
				<Statistic
					value={value}
					prefix={prefix}
					precision={precision ?? 0}
					valueStyle={{ color, fontSize: 28, fontWeight: 700 }}
				/>
				{subText && <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{subText}</Text>}
				{sparkData && <div style={{ marginTop: 8 }}><Sparkline data={sparkData} color={color} /></div>}
			</div>
			<div style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color, flexShrink: 0 }}>
				{icon}
			</div>
		</div>
	</Card>
);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function Home() {
	const [dashboard, setDashboard] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetch = async () => {
			try {
				setLoading(true);
				const res = await adminApi.getDashboard();
				setDashboard(res);
			} catch (err: any) {
				setError(err?.message || 'Failed to load dashboard');
			} finally {
				setLoading(false);
			}
		};
		fetch();
	}, []);

	const d = dashboard?.data || dashboard || {};

	// Build monthly revenue array (last 12 months ordered)
	const monthlyData: { label: string; value: number }[] = (() => {
		const raw: any[] = d?.monthlyRevenue || [];
		if (!raw.length) return [];
		return raw.slice(-8).map((r: any) => ({
			label: MONTHS[(r._id?.month ?? 1) - 1],
			value: r.revenue ?? 0,
		}));
	})();

	const revenueSparkData = monthlyData.map(m => m.value);

	// Recent orders table
	const orderCols = [
		{
			title: 'Student',
			key: 'user',
			render: (_: any, r: any) => (
				<Space>
					<Avatar size={28} src={r.userId?.avatar} style={{ background: '#1890ff', fontSize: 12 }}>
						{r.userId?.name?.[0]}
					</Avatar>
					<Text style={{ fontSize: 13 }}>{r.userId?.name}</Text>
				</Space>
			),
		},
		{
			title: 'Course',
			key: 'course',
			render: (_: any, r: any) => <Text style={{ fontSize: 13 }}>{r.courseId?.title}</Text>,
		},
		{
			title: 'Amount',
			key: 'amount',
			align: 'right' as const,
			render: (_: any, r: any) => (
				<Text style={{ fontWeight: 600, color: '#52c41a' }}>{(r.finalAmount || r.amount || 0).toLocaleString('vi-VN')}₫</Text>
			),
		},
		{
			title: 'Status',
			key: 'status',
			render: (_: any, r: any) => {
				const s = r.status || r.paymentStatus;
				const colors: Record<string, string> = { paid: 'success', completed: 'success', pending: 'warning', failed: 'error' };
				return <Tag color={colors[s] || 'default'}>{s?.toUpperCase()}</Tag>;
			},
		},
	];

	// Top courses table
	const courseCols = [
		{
			title: 'Course',
			key: 'course',
			render: (_: any, r: any) => (
				<Space>
					{r.thumbnail && <img src={r.thumbnail} style={{ width: 36, height: 26, objectFit: 'cover', borderRadius: 4 }} alt='' />}
					<Text style={{ fontSize: 13, fontWeight: 500 }}>{r.title}</Text>
				</Space>
			),
		},
		{
			title: 'Students',
			dataIndex: 'studentsEnrolled',
			key: 'students',
			align: 'center' as const,
			width: 90,
			render: (v: number) => <Tag color='blue'>{v ?? 0}</Tag>,
		},
		{
			title: 'Rating',
			key: 'rating',
			align: 'center' as const,
			width: 90,
			render: (_: any, r: any) =>
				r.ratings?.average > 0 ? (
					<Tag color='gold'>⭐ {r.ratings.average.toFixed(1)}</Tag>
				) : '—',
		},
	];

	return (
		<div className='home-page'>
			<Title level={2} style={{ marginBottom: 24, fontWeight: 700, color: '#111827' }}>
				Dashboard Overview
			</Title>

			{error && <Alert type='error' message={error} style={{ marginBottom: 16 }} />}

			{loading ? (
				<div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
					<Spin size='large' />
				</div>
			) : (
				<>
					{/* ── Stat Cards ── */}
					<Row gutter={[20, 20]}>
						<Col xs={24} sm={12} xl={6}>
							<StatCard
								title='Total Users'
								value={d?.users?.total ?? 0}
								icon={<UserOutlined />}
								color='#1890ff'
								bg='#e6f4ff'
								subText={`${d?.users?.students ?? 0} students · ${d?.users?.instructors ?? 0} instructors`}
							/>
						</Col>
						<Col xs={24} sm={12} xl={6}>
							<StatCard
								title='Total Courses'
								value={d?.courses?.total ?? 0}
								icon={<BookOutlined />}
								color='#52c41a'
								bg='#f6ffed'
								subText={`${d?.courses?.published ?? 0} published · ${d?.courses?.pending ?? 0} pending`}
							/>
						</Col>
						<Col xs={24} sm={12} xl={6}>
							<StatCard
								title='Total Revenue'
								value={d?.revenue?.total ?? 0}
								icon={<DollarOutlined />}
								color='#fa8c16'
								bg='#fff7e6'
								subText={`${d?.revenue?.totalOrders ?? 0} paid orders`}
								sparkData={revenueSparkData}
							/>
						</Col>
						<Col xs={24} sm={12} xl={6}>
							<StatCard
								title='Total Enrollments'
								value={d?.enrollments?.total ?? 0}
								icon={<TeamOutlined />}
								color='#722ed1'
								bg='#f9f0ff'
								subText={`${d?.enrollments?.completed ?? 0} completed`}
							/>
						</Col>
					</Row>

					{/* ── Secondary Stats ── */}
					<Row gutter={[20, 20]} style={{ marginTop: 20 }}>
						<Col xs={24} sm={8}>
							<Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }} styles={{ body: { padding: '18px 20px' } }}>
								<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
									<div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff2e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fa541c' }}>
										<ShoppingOutlined />
									</div>
									<div>
										<Text style={{ color: '#6b7280', fontSize: 12 }}>Online Users</Text>
										<div style={{ fontSize: 22, fontWeight: 700, color: '#fa541c' }}>{d?.users?.online ?? 0}</div>
									</div>
								</div>
							</Card>
						</Col>
						<Col xs={24} sm={8}>
							<Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }} styles={{ body: { padding: '18px 20px' } }}>
								<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
									<div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#2f54eb' }}>
										<CheckCircleOutlined />
									</div>
									<div>
										<Text style={{ color: '#6b7280', fontSize: 12 }}>Active Enrollments</Text>
										<div style={{ fontSize: 22, fontWeight: 700, color: '#2f54eb' }}>{d?.enrollments?.active ?? 0}</div>
									</div>
								</div>
							</Card>
						</Col>
						<Col xs={24} sm={8}>
							<Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }} styles={{ body: { padding: '18px 20px' } }}>
								<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
									<div style={{ width: 44, height: 44, borderRadius: 12, background: '#f6ffed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#52c41a' }}>
										<RiseOutlined />
									</div>
									<div>
										<Text style={{ color: '#6b7280', fontSize: 12 }}>Avg Order Value</Text>
										<div style={{ fontSize: 22, fontWeight: 700, color: '#52c41a' }}>
											{(d?.revenue?.averageOrderValue ?? 0).toLocaleString('vi-VN')}₫
										</div>
									</div>
								</div>
							</Card>
						</Col>
					</Row>

					{/* ── Charts Row ── */}
					{monthlyData.length > 0 && (
						<Row gutter={[20, 20]} style={{ marginTop: 20 }}>
							<Col xs={24} lg={14}>
								<Card
									title={<span style={{ fontWeight: 700 }}>Monthly Revenue Trend</span>}
									style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
									styles={{ body: { padding: '16px 20px 20px' } }}
								>
									<div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, paddingTop: 8 }}>
										{monthlyData.map((item, idx) => {
											const max = Math.max(...monthlyData.map(m => m.value), 1);
											const h = Math.max(8, (item.value / max) * 100);
											return (
												<div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
													<Text style={{ fontSize: 10, color: '#6b7280', fontWeight: 600 }}>
														{item.value > 0 ? `${(item.value / 1000000).toFixed(1)}M` : ''}
													</Text>
													<div
														style={{
															width: '100%',
															height: h,
															background: 'linear-gradient(180deg, #1890ff 0%, #096dd9 100%)',
															borderRadius: '6px 6px 0 0',
															transition: 'height 0.4s ease',
														}}
													/>
													<Text style={{ fontSize: 10, color: '#9ca3af' }}>{item.label}</Text>
												</div>
											);
										})}
									</div>
								</Card>
							</Col>

							<Col xs={24} lg={10}>
								<Card
									title={<span style={{ fontWeight: 700 }}>Course Status</span>}
									style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', height: '100%' }}
									styles={{ body: { padding: '16px 20px' } }}
								>
									{[
										{ label: 'Published', value: d?.courses?.published ?? 0, color: '#52c41a' },
										{ label: 'Pending Review', value: d?.courses?.pending ?? 0, color: '#fa8c16' },
										{ label: 'Draft', value: d?.courses?.draft ?? 0, color: '#8c8c8c' },
									].map((item) => {
										const total = d?.courses?.total || 1;
										return (
											<div key={item.label} style={{ marginBottom: 14 }}>
												<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
													<Text style={{ fontSize: 13 }}>{item.label}</Text>
													<Text style={{ fontSize: 13, fontWeight: 600, color: item.color }}>
														{item.value}
													</Text>
												</div>
												<Progress
													percent={Math.round((item.value / total) * 100)}
													strokeColor={item.color}
													showInfo={false}
													size='small'
												/>
											</div>
										);
									})}
								</Card>
							</Col>
						</Row>
					)}

					{/* ── Tables Row ── */}
					<Row gutter={[20, 20]} style={{ marginTop: 20 }}>
						{/* Recent Orders */}
						<Col xs={24} lg={12}>
							<Card
								title={<span style={{ fontWeight: 700 }}>Recent Orders</span>}
								style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
								styles={{ body: { padding: 0 } }}
							>
								<Table
									dataSource={d?.recentOrders || []}
									columns={orderCols}
									rowKey='_id'
									pagination={false}
									size='small'
									scroll={{ x: 400 }}
								/>
							</Card>
						</Col>

						{/* Top Courses */}
						<Col xs={24} lg={12}>
							<Card
								title={<span style={{ fontWeight: 700 }}>Top Courses by Enrollment</span>}
								style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
								styles={{ body: { padding: 0 } }}
							>
								<Table
									dataSource={d?.topCourses || []}
									columns={courseCols}
									rowKey='_id'
									pagination={false}
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

export default Home;
