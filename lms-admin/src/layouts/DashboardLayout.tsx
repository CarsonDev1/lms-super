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
		if (!isAuthenticated) {
			navigate('/login');
		}
	}, [isAuthenticated, navigate]);

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
