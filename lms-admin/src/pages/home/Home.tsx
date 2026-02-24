import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Alert } from 'antd';
import { UserOutlined, BookOutlined, ShoppingOutlined, DollarOutlined } from '@ant-design/icons';
import { adminApi } from '@/api/admin';
import './Home.scss';

const { Title } = Typography;

function Home() {
	const [dashboard, setDashboard] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchDashboard = async () => {
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
		fetchDashboard();
	}, []);

	const resData = dashboard?.data || dashboard || {};

	const stats = [
		{
			title: 'Total Users',
			value: resData?.users?.total ?? 0,
			icon: <UserOutlined />,
			color: '#1890ff',
			bg: '#e6f7ff',
		},
		{
			title: 'Total Courses',
			value: resData?.courses?.total ?? 0,
			icon: <BookOutlined />,
			color: '#52c41a',
			bg: '#f6ffed',
		},
		{
			title: 'Total Orders',
			value: resData?.revenue?.totalOrders ?? 0,
			icon: <ShoppingOutlined />,
			color: '#722ed1',
			bg: '#f9f0ff',
		},
		{
			title: 'Total Revenue',
			value: resData?.revenue?.total ?? 0,
			icon: <DollarOutlined />,
			color: '#fa8c16',
			bg: '#fff7e6',
			prefix: '$',
			precision: 2,
		},
	];

	return (
		<div className='home-page'>
			<Title level={2} style={{ marginBottom: 24 }}>
				Dashboard Overview
			</Title>

			{error && <Alert type='error' message={error} style={{ marginBottom: 16 }} />}

			{loading ? (
				<div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
					<Spin size='large' />
				</div>
			) : (
				<Row gutter={[24, 24]}>
					{stats.map((stat) => (
						<Col xs={24} sm={12} lg={6} key={stat.title}>
							<Card
								style={{
									borderRadius: 12,
									border: 'none',
									boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
									background: '#fff',
								}}
								styles={{ body: { padding: '24px' } }}
							>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										flexWrap: 'wrap',
										gap: 16,
									}}
								>
									<div style={{ minWidth: 0, overflow: 'hidden' }}>
										<p
											style={{
												color: '#6b7280',
												fontSize: 13,
												marginBottom: 8,
												fontWeight: 500,
												whiteSpace: 'nowrap',
												textOverflow: 'ellipsis',
												overflow: 'hidden',
											}}
										>
											{stat.title}
										</p>
										<Statistic
											value={stat.value}
											prefix={stat.prefix}
											precision={stat.precision}
											valueStyle={{ color: stat.color, fontSize: 28, fontWeight: 700 }}
										/>
									</div>
									<div
										style={{
											width: 52,
											height: 52,
											borderRadius: 12,
											background: stat.bg,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontSize: 22,
											color: stat.color,
											flexShrink: 0,
										}}
									>
										{stat.icon}
									</div>
								</div>
							</Card>
						</Col>
					))}
				</Row>
			)}
		</div>
	);
}

export default Home;
