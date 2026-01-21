import Categories from '@/pages/categories/Categories';
import Home from '@/pages/home/Home';
import Users from '@/pages/users/Users';
import { ReactNode } from 'react';

interface AppRoute {
	path: string;
	element: ReactNode;
	name: string;
}

export const dashboardRoutes: AppRoute[] = [
	{
		path: '/',
		element: <Home />,
		name: 'Dashboard',
	},
	{
		path: '/categories',
		element: <Categories />,
		name: 'Categories',
	},
	{
		path: '/courses',
		element: <div>Courses Page</div>,
		name: 'Courses',
	},
	{
		path: '/users',
		element: <Users />,
		name: 'Users',
	},
	{
		path: '/settings',
		element: <div>Settings Page</div>,
		name: 'Settings',
	},
];
