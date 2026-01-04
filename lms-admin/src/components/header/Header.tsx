import { Button, Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import './Header.scss';
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

const { Header } = Layout;

function DashboardHeader({
	handleCollapse,
	sidebarCollapsed,
}: {
	handleCollapse: (collapsed: boolean) => void;
	sidebarCollapsed: boolean;
}) {
	const navigate = useNavigate();
	const logout = useAuthStore((state) => state.logout);

	const handleLogout = async () => {
		logout();
		navigate('/login');
	};

	return (
		<Header className='dashboard-header'>
			<Button
				type='text'
				icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
				onClick={() => handleCollapse(!sidebarCollapsed)}
				style={{
					fontSize: '16px',
				}}
			/>
			<div className='header-right'>
				<LogoutOutlined onClick={handleLogout} style={{ fontSize: 18, cursor: 'pointer' }} title='Logout' />
			</div>
		</Header>
	);
}

export default DashboardHeader;
