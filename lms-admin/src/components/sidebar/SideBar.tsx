import { Layout, Menu, MenuProps } from 'antd';

import { useLocation, useNavigate } from 'react-router-dom';
import { BookOutlined, DashboardOutlined, MedicineBoxOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import Logo from '@/assets/images/logo.png';
import './SideBar.scss';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function SideBar({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
	const navigate = useNavigate();
	const location = useLocation();

	const handleMenuClick = (e: { key: string }) => {
		navigate(e.key);
	};

	const menuItems: MenuItem[] = [
		{
			key: '/',
			icon: <DashboardOutlined style={{ fontSize: '18px' }} />,
			label: 'Dashboard',
		},
		{
			key: '/courses',
			icon: <BookOutlined style={{ fontSize: '18px' }} />,
			label: 'Courses',
		},
		{
			key: '/categories',
			icon: <MedicineBoxOutlined style={{ fontSize: '18px' }} />,
			label: 'Categories',
		},
		{
			key: '/users',
			icon: <UserOutlined style={{ fontSize: '18px' }} />,
			label: 'Users',
		},
		{
			key: '/settings',
			icon: <SettingOutlined style={{ fontSize: '18px' }} />,
			label: 'Settings',
		},
	];

	return (
		<Sider collapsible collapsed={sidebarCollapsed} theme='dark' trigger={null} width={250}>
			<div className='sidebar'>
				<div className={`${sidebarCollapsed ? 'sidebar-logo-collapsed' : 'sidebar-logo'}`}>
					<img src={Logo} alt='LMS Logo' className='img-logo' />
				</div>
				<Menu
					className='sidebar-menu'
					selectedKeys={[location.pathname]}
					items={menuItems}
					onClick={handleMenuClick}
				/>
			</div>
		</Sider>
	);
}

export default SideBar;
