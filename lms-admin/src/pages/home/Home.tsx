import { Typography, Row, Col, Card, Statistic } from 'antd';
import { UserOutlined, BookOutlined, ShoppingOutlined, DollarOutlined } from '@ant-design/icons';
import './Home.scss';

const { Title } = Typography;

function Home() {
	return (
		<div className='home-page'>
			<Title level={2}>Dashboard Overview</Title>

			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title='Total Users'
							value={1234}
							prefix={<UserOutlined />}
							valueStyle={{ color: '#3f8600' }}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title='Total Courses'
							value={56}
							prefix={<BookOutlined />}
							valueStyle={{ color: '#1890ff' }}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title='Total Orders'
							value={789}
							prefix={<ShoppingOutlined />}
							valueStyle={{ color: '#cf1322' }}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title='Revenue'
							value={12345}
							prefix={<DollarOutlined />}
							precision={2}
							valueStyle={{ color: '#faad14' }}
						/>
					</Card>
				</Col>
			</Row>
		</div>
	);
}

export default Home;
