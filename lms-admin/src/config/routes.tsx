import Announcements from '@/pages/announcements/Announcements';
import AuditLogs from '@/pages/audit-logs/AuditLogs';
import Categories from '@/pages/categories/Categories';
import CmsPages from '@/pages/cms/CmsPages';
import Coupons from '@/pages/coupons/Coupons';
import Courses from '@/pages/courses/Courses';
import Achievements from '@/pages/gamification/Achievements';
import Home from '@/pages/home/Home';
import InstructorCourses from '@/pages/instructor/InstructorCourses';
import InstructorHome from '@/pages/instructor/InstructorHome';
import InstructorQuizzes from '@/pages/instructor/InstructorQuizzes';
import MySubmissions from '@/pages/instructor/MySubmissions';
import Levels from '@/pages/levels/Levels';
import Revenue from '@/pages/revenue/Revenue';
import Users from '@/pages/users/Users';
import { ReactNode } from 'react';

interface AppRoute {
	path: string;
	element: ReactNode;
	name: string;
	roles?: string[];
}

// ─── Admin & Reviewer routes ──────────────────────────────────────────────────
export const adminRoutes: AppRoute[] = [
	{
		path: '/',
		element: <Home />,
		name: 'Dashboard',
		roles: ['admin', 'reviewer'],
	},
	{
		path: '/courses',
		element: <Courses />,
		name: 'Course Approvals',
		roles: ['admin', 'reviewer'],
	},
	{
		path: '/categories',
		element: <Categories />,
		name: 'Categories',
		roles: ['admin'],
	},
	{
		path: '/levels',
		element: <Levels />,
		name: 'Levels',
		roles: ['admin'],
	},
	{
		path: '/users',
		element: <Users />,
		name: 'Users',
		roles: ['admin'],
	},
	{
		path: '/coupons',
		element: <Coupons />,
		name: 'Coupons',
		roles: ['admin'],
	},
	{
		path: '/announcements',
		element: <Announcements />,
		name: 'Announcements',
		roles: ['admin'],
	},
	{
		path: '/cms',
		element: <CmsPages />,
		name: 'CMS Pages',
		roles: ['admin'],
	},
	{
		path: '/achievements',
		element: <Achievements />,
		name: 'Achievements',
		roles: ['admin'],
	},
	{
		path: '/revenue',
		element: <Revenue />,
		name: 'Revenue',
		roles: ['admin'],
	},
	{
		path: '/audit-logs',
		element: <AuditLogs />,
		name: 'Audit Logs',
		roles: ['admin'],
	},
];

// ─── Instructor routes ────────────────────────────────────────────────────────
export const instructorRoutes: AppRoute[] = [
	{
		path: '/instructor',
		element: <InstructorHome />,
		name: 'Instructor Dashboard',
		roles: ['instructor'],
	},
	{
		path: '/instructor/courses',
		element: <InstructorCourses />,
		name: 'My Courses',
		roles: ['instructor'],
	},
	{
		path: '/instructor/quizzes',
		element: <InstructorQuizzes />,
		name: 'My Quizzes',
		roles: ['instructor'],
	},
	{
		path: '/instructor/submissions',
		element: <MySubmissions />,
		name: 'My Submissions',
		roles: ['instructor'],
	},
];

// ─── All combined ─────────────────────────────────────────────────────────────
export const dashboardRoutes: AppRoute[] = [...adminRoutes, ...instructorRoutes];
