import { Layout, Menu, MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
	AuditOutlined,
	BarChartOutlined,
	BookOutlined,
	DashboardOutlined,
	FileTextOutlined,
	FileSearchOutlined,
	MedicineBoxOutlined,
	NotificationOutlined,
	OrderedListOutlined,
	QuestionCircleOutlined,
	TagsOutlined,
	TrophyOutlined,
	UserOutlined,
} from '@ant-design/icons';
import Logo from '@/assets/images/logo.png';
import './SideBar.scss';
import { useAuthStore } from '@/stores/authStore';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function SideBar({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
	const navigate = useNavigate();
	const location = useLocation();
	const user = useAuthStore((state) => state.user);
	const role = user?.role;

	const handleMenuClick = (e: { key: string }) => {
		navigate(e.key);
	};

	const adminMenu: MenuItem[] = [
		{
			key: '/',
			icon: <DashboardOutlined style={{ fontSize: '18px' }} />,
			label: 'Dashboard',
		},
		{
			key: '/courses',
			icon: <BookOutlined style={{ fontSize: '18px' }} />,
			label: 'Course Approvals',
		},
		{
			key: '/categories',
			icon: <MedicineBoxOutlined style={{ fontSize: '18px' }} />,
			label: 'Categories',
		},
		{
			key: '/levels',
			icon: <OrderedListOutlined style={{ fontSize: '18px' }} />,
			label: 'Levels',
		},
		{
			key: '/users',
			icon: <UserOutlined style={{ fontSize: '18px' }} />,
			label: 'Users',
		},
		{
			key: '/coupons',
			icon: <TagsOutlined style={{ fontSize: '18px' }} />,
			label: 'Coupons',
		},
		{
			key: '/announcements',
			icon: <NotificationOutlined style={{ fontSize: '18px' }} />,
			label: 'Announcements',
		},
		{
			key: '/cms',
			icon: <FileTextOutlined style={{ fontSize: '18px' }} />,
			label: 'CMS Pages',
		},
		{
			key: '/achievements',
			icon: <TrophyOutlined style={{ fontSize: '18px' }} />,
			label: 'Achievements',
		},
		{
			key: '/revenue',
			icon: <BarChartOutlined style={{ fontSize: '18px' }} />,
			label: 'Revenue',
		},
		{
			key: '/audit-logs',
			icon: <AuditOutlined style={{ fontSize: '18px' }} />,
			label: 'Audit Logs',
		},
	];

	const instructorMenu: MenuItem[] = [
		{
			key: '/instructor',
			icon: <DashboardOutlined style={{ fontSize: '18px' }} />,
			label: 'Dashboard',
		},
		{
			key: '/instructor/courses',
			icon: <BookOutlined style={{ fontSize: '18px' }} />,
			label: 'My Courses',
		},
		{
			key: '/instructor/quizzes',
			icon: <QuestionCircleOutlined style={{ fontSize: '18px' }} />,
			label: 'My Quizzes',
		},
		{
			key: '/instructor/submissions',
			icon: <FileSearchOutlined style={{ fontSize: '18px' }} />,
			label: 'My Submissions',
		},
	];

	const reviewerMenu: MenuItem[] = [
		{
			key: '/',
			icon: <DashboardOutlined style={{ fontSize: '18px' }} />,
			label: 'Dashboard',
		},
		{
			key: '/courses',
			icon: <BookOutlined style={{ fontSize: '18px' }} />,
			label: 'Course Approvals',
		},
	];

	const menuItems =
		role === 'admin'
			? adminMenu
			: role === 'instructor'
				? instructorMenu
				: role === 'reviewer'
					? reviewerMenu
					: adminMenu;

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
