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
	ShoppingOutlined,
	StarOutlined,
	TagsOutlined,
	TeamOutlined,
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

	const mk = (key: string, label: string, icon: React.ReactNode): MenuItem => ({ key, icon, label });

	const adminMenu: MenuItem[] = [
		mk('/', 'Dashboard', <DashboardOutlined />),
		{ type: 'divider' as const },
		{
			key: 'grp-content',
			type: 'group' as const,
			label: sidebarCollapsed ? '' : 'Content',
			children: [
				mk('/courses', 'Course Approvals', <BookOutlined />),
				mk('/categories', 'Categories', <MedicineBoxOutlined />),
				mk('/levels', 'Levels', <OrderedListOutlined />),
			],
		},
		{
			key: 'grp-commerce',
			type: 'group' as const,
			label: sidebarCollapsed ? '' : 'Commerce',
			children: [
				mk('/users', 'Users', <UserOutlined />),
				mk('/orders', 'Orders', <ShoppingOutlined />),
				mk('/enrollments', 'Enrollments', <TeamOutlined />),
				mk('/reviews', 'Reviews', <StarOutlined />),
				mk('/coupons', 'Coupons', <TagsOutlined />),
			],
		},
		{
			key: 'grp-platform',
			type: 'group' as const,
			label: sidebarCollapsed ? '' : 'Platform',
			children: [
				mk('/announcements', 'Announcements', <NotificationOutlined />),
				mk('/cms', 'CMS Pages', <FileTextOutlined />),
				mk('/achievements', 'Achievements', <TrophyOutlined />),
			],
		},
		{
			key: 'grp-reports',
			type: 'group' as const,
			label: sidebarCollapsed ? '' : 'Reports',
			children: [
				mk('/revenue', 'Revenue', <BarChartOutlined />),
				mk('/audit-logs', 'Audit Logs', <AuditOutlined />),
			],
		},
	];

	const instructorMenu: MenuItem[] = [
		mk('/instructor', 'Dashboard', <DashboardOutlined />),
		{ type: 'divider' as const },
		{
			key: 'grp-teaching',
			type: 'group' as const,
			label: sidebarCollapsed ? '' : 'Teaching',
			children: [
				mk('/instructor/courses', 'My Courses', <BookOutlined />),
				mk('/instructor/quizzes', 'My Quizzes', <QuestionCircleOutlined />),
			],
		},
		{
			key: 'grp-review',
			type: 'group' as const,
			label: sidebarCollapsed ? '' : 'Review',
			children: [
				mk('/instructor/submissions', 'My Submissions', <FileSearchOutlined />),
			],
		},
	];

	const reviewerMenu: MenuItem[] = [
		mk('/', 'Dashboard', <DashboardOutlined />),
		{ type: 'divider' as const },
		mk('/courses', 'Course Approvals', <BookOutlined />),
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
