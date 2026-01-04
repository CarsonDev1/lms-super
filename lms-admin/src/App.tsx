import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login/Login';
import DashboardLayout from './layouts/DashboardLayout';
import { dashboardRoutes } from './config/routes';
import './App.scss';

function App() {
	return (
		<Router>
			<Routes>
				<Route path='/login' element={<Login />} />
				<Route path='/' element={<DashboardLayout />}>
					{dashboardRoutes.map((route) => (
						<Route key={route.path} path={route.path} element={route.element} />
					))}
				</Route>
			</Routes>
		</Router>
	);
}

export default App;
