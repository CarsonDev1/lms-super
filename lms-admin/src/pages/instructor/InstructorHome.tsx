import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Alert, Tag, Table } from 'antd';
import { BookOutlined, DollarOutlined, UserOutlined, StarOutlined, RiseOutlined } from '@ant-design/icons';
import { instructorApi } from '@/api/instructor';

const { Title } = Typography;

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

	const resData = dashboard?.data || dashboard || {};

	const stats = [
		{
			title: 'My Courses',
			value: resData?.courses?.total ?? 0,
			icon: <BookOutlined />,
			color: '#1890ff',
			bg: '#e6f7ff',
			suffix: (
				<div style={{ fontSize: 12, marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
					<Tag color='success'>Published: {resData?.courses?.published ?? 0}</Tag>
					<Tag color='warning'>Pending: {resData?.courses?.pending ?? 0}</Tag>
					<Tag color='default'>Draft: {resData?.courses?.draft ?? 0}</Tag>
				</div>
			),
		},
		{
			title: 'Total Students',
			value: resData?.enrollments?.total ?? 0,
			icon: <UserOutlined />,
			color: '#52c41a',
			bg: '#f6ffed',
			suffix: (
				<div style={{ fontSize: 12, marginTop: 4 }}>
					<Tag color='blue'>This month: +{resData?.enrollments?.thisMonth ?? 0}</Tag>
				</div>
			),
		},
		{
			title: 'Total Revenue',
			value: resData?.revenue?.total ?? 0,
			icon: <DollarOutlined />,
			color: '#fa8c16',
			bg: '#fff7e6',
			prefix: '$',
			precision: 2,
			suffix: (
				<div style={{ fontSize: 12, marginTop: 4 }}>
					<Tag color='green' icon={<RiseOutlined />}>
						This month: ${resData?.revenue?.thisMonth ?? 0}
					</Tag>
				</div>
			),
		},
		{
			title: 'Average Rating',
			value: resData?.ratings?.average ?? 0,
			icon: <StarOutlined />,
			color: '#faad14',
			bg: '#fffbe6',
			precision: 1,
			suffix: (
				<div style={{ fontSize: 12, marginTop: 4 }}>
					<Tag>{resData?.ratings?.total ?? 0} reviews</Tag>
				</div>
			),
		},
	];

	const topCourseColumns = [
		{
			title: 'Course',
			dataIndex: 'title',
			key: 'title',
			render: (text: string) => <strong>{text}</strong>,
		},
		{
			title: 'Students',
			dataIndex: 'totalStudents',
			key: 'students',
			align: 'center' as const,
		},
		{
			title: 'Rating',
			dataIndex: ['ratings', 'average'],
			key: 'rating',
			align: 'center' as const,
			render: (v: number) => (v ? `⭐ ${v.toFixed(1)}` : '—'),
		},
		{
			title: 'Revenue',
			dataIndex: 'revenue',
			key: 'revenue',
			align: 'right' as const,
			render: (v: number) => `$${(v || 0).toLocaleString()}`,
		},
	];

	return (
		<div>
			<Title level={2} style={{ marginBottom: 24 }}>
				Instructor Dashboard
			</Title>

			{error && <Alert type='error' message={error} style={{ marginBottom: 16 }} />}

			{loading ? (
				<div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
					<Spin size='large' />
				</div>
			) : (
				<>
					<Row gutter={[24, 24]}>
						{stats.map((stat) => (
							<Col xs={24} sm={12} xl={6} key={stat.title}>
								<Card
									style={{
										borderRadius: 12,
										border: 'none',
										boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
										height: '100%',
									}}
									styles={{ body: { padding: '20px 24px' } }}
								>
									<div
										style={{
											display: 'flex',
											alignItems: 'flex-start',
											justifyContent: 'space-between',
											gap: 12,
										}}
									>
										<div style={{ flex: 1, minWidth: 0 }}>
											<p
												style={{
													color: '#6b7280',
													fontSize: 13,
													marginBottom: 6,
													fontWeight: 500,
												}}
											>
												{stat.title}
											</p>
											<Statistic
												value={stat.value}
												prefix={stat.prefix}
												precision={stat.precision}
												valueStyle={{ color: stat.color, fontSize: 26, fontWeight: 700 }}
											/>
											{stat.suffix}
										</div>
										<div
											style={{
												width: 48,
												height: 48,
												borderRadius: 12,
												background: stat.bg,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												fontSize: 20,
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

					{resData?.topCourses?.length > 0 && (
						<Card
							title='Top Performing Courses'
							style={{
								marginTop: 24,
								borderRadius: 12,
								border: 'none',
								boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
							}}
						>
							<Table
								dataSource={resData?.topCourses || []}
								columns={topCourseColumns}
								rowKey='_id'
								pagination={false}
								size='small'
							/>
						</Card>
					)}
				</>
			)}
		</div>
	);
}

export default InstructorHome;
