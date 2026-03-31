import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Result, Button } from 'antd';

interface ProtectedRouteProps {
	children: React.ReactNode;
	roles?: string[];
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
	const user = useAuthStore((state) => state.user);

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (roles && roles.length > 0 && !roles.includes(user.role)) {
		return (
			<Result
				status="403"
				title="403"
				subTitle="Sorry, you are not authorized to access this page."
				extra={
					<Button type="primary" onClick={() => window.history.back()}>
						Go Back
					</Button>
				}
			/>
		);
	}

	return <>{children}</>;
};

export default ProtectedRoute;
