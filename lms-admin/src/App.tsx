import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login/Login';
import DashboardLayout from './layouts/DashboardLayout';
import { dashboardRoutes } from './config/routes';
import ProtectedRoute from './components/ProtectedRoute';
import './App.scss';

function App() {
	return (
		<Router>
			<Routes>
				<Route path='/login' element={<Login />} />
				<Route path='/' element={<DashboardLayout />}>
					{dashboardRoutes.map((route) => (
						<Route
							key={route.path}
							path={route.path}
							element={
								<ProtectedRoute roles={route.roles}>
									{route.element}
								</ProtectedRoute>
							}
						/>
					))}
				</Route>
				<Route path='*' element={<Navigate to='/' replace />} />
			</Routes>
		</Router>
	);
}

export default App;
