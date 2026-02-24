import { useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import SideBar from '@/components/sidebar/SideBar';
import DashboardHeader from '@/components/header/Header';
import './DashboardLayout.scss';
import { useEffect } from 'react';
import { Layout } from 'antd';
import { useAppStore } from '@/stores/appStore';

const { Content } = Layout;

function DashboardLayout() {
	const navigate = useNavigate();
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();

	useEffect(() => {
		// Check authentication
		if (!isAuthenticated) {
			navigate('/login');
			return;
		}

		// Handle responsive sidebar
		const handleResize = () => {
			const mobile = window.innerWidth <= 768;
			if (mobile && !sidebarCollapsed) {
				setSidebarCollapsed(true);
			}
		};

		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [isAuthenticated, navigate, sidebarCollapsed, setSidebarCollapsed]);

	const handleCollapse = (collapsed: boolean) => {
		setSidebarCollapsed(collapsed);
	};

	return (
		<Layout className='dashboard-layout'>
			<SideBar sidebarCollapsed={sidebarCollapsed} />
			<Layout>
				<DashboardHeader handleCollapse={handleCollapse} sidebarCollapsed={sidebarCollapsed} />
				<Content className='dashboard-content'>
					<Outlet />
				</Content>
			</Layout>
		</Layout>
	);
}

export default DashboardLayout;
