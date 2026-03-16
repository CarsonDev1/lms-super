import { Avatar, Button, Dropdown, Layout, Space, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import './Header.scss';
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Text } = Typography;

const roleColor: Record<string, string> = {
	admin: 'red',
	instructor: 'blue',
	reviewer: 'orange',
	student: 'green',
};

function DashboardHeader({
	handleCollapse,
	sidebarCollapsed,
}: {
	handleCollapse: (collapsed: boolean) => void;
	sidebarCollapsed: boolean;
}) {
	const navigate = useNavigate();
	const logout = useAuthStore((state) => state.logout);
	const user = useAuthStore((state) => state.user);

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	const dropdownItems = [
		{
			key: 'info',
			label: (
				<div style={{ padding: '4px 0', minWidth: 160 }}>
					<div style={{ fontWeight: 600, fontSize: 14 }}>{user?.name}</div>
					<Text type='secondary' style={{ fontSize: 12 }}>{user?.email}</Text>
				</div>
			),
			disabled: true,
		},
		{ type: 'divider' as const },
		{
			key: 'logout',
			icon: <LogoutOutlined />,
			label: 'Sign Out',
			danger: true,
			onClick: handleLogout,
		},
	];

	return (
		<Header className='dashboard-header'>
			<Button
				type='text'
				icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
				onClick={() => handleCollapse(!sidebarCollapsed)}
				style={{ fontSize: 16 }}
			/>

			<div className='header-right'>
				<Dropdown menu={{ items: dropdownItems }} placement='bottomRight' trigger={['click']}>
					<Space style={{ cursor: 'pointer', gap: 10 }}>
						<Avatar
							style={{ background: 'linear-gradient(135deg, #001656, #0071f9)', fontWeight: 700 }}
							icon={<UserOutlined />}
							size={34}
						>
							{user?.name?.[0]?.toUpperCase()}
						</Avatar>
						<div className='user-info-text'>
							<div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', lineHeight: 1.3 }}>
								{user?.name}
							</div>
							<Tag
								color={roleColor[user?.role || ''] || 'default'}
								style={{ fontSize: 10, lineHeight: '16px', padding: '0 6px', margin: 0 }}
							>
								{user?.role?.toUpperCase()}
							</Tag>
						</div>
					</Space>
				</Dropdown>
			</div>
		</Header>
	);
}

export default DashboardHeader;
