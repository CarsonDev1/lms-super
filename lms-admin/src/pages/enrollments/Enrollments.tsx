import { enrollmentsApi, Enrollment } from '@/api/enrollments';
import DataTable from '@/components/datatable/DataTable';
import PageHeader from '@/components/page-header/PageHeader';
import { usePaginatedFetch } from '@/hooks/useFetch';
import { CheckCircleOutlined, ClockCircleOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import {
	Avatar,
	Button,
	Input,
	Progress,
	Space,
	Tag,
	Typography,
} from 'antd';
import { TableColumnType } from 'antd';
import { useState } from 'react';

const { Text } = Typography;

const Enrollments = () => {
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');

	const { data, pagination, loading, refetch, page, pageSize, setPage, setPageSize } =
		usePaginatedFetch<Enrollment>(
			`enrollments-${search}`,
			(params) => enrollmentsApi.getAllEnrollments({ ...params, search }),
		);

	const handleSearch = () => setSearch(searchInput);

	const columns: TableColumnType<Enrollment>[] = [
		{
			title: '#',
			key: 'index',
			align: 'center',
			width: 55,
			render: (_: any, __: any, i: number) => (page - 1) * pageSize + i + 1,
		},
		{
			title: 'Student',
			key: 'user',
			width: 220,
			fixed: 'left',
			render: (_: any, record: Enrollment) => (
				<Space>
					<Avatar src={record.userId?.avatar} size={32} style={{ background: '#52c41a' }}>
						{record.userId?.name?.[0]}
					</Avatar>
					<div>
						<div style={{ fontWeight: 600, fontSize: 13 }}>{record.userId?.name}</div>
						<Text type='secondary' style={{ fontSize: 11 }}>
							{record.userId?.email}
						</Text>
					</div>
				</Space>
			),
		},
		{
			title: 'Course',
			key: 'course',
			width: 240,
			render: (_: any, record: Enrollment) => (
				<Space>
					{record.courseId?.thumbnail ? (
						<img
							src={record.courseId.thumbnail}
							style={{ width: 40, height: 28, objectFit: 'cover', borderRadius: 4 }}
							alt=''
						/>
					) : (
						<div
							style={{
								width: 40,
								height: 28,
								background: '#f0f0f0',
								borderRadius: 4,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						/>
					)}
					<Text style={{ fontSize: 13, fontWeight: 500 }}>{record.courseId?.title}</Text>
				</Space>
			),
		},
		{
			title: 'Progress',
			dataIndex: 'completionPercentage',
			key: 'progress',
			width: 160,
			render: (pct: number) => (
				<div>
					<Progress
						percent={pct}
						size='small'
						status={pct === 100 ? 'success' : 'active'}
						strokeColor={pct === 100 ? '#52c41a' : '#1890ff'}
					/>
					<Text style={{ fontSize: 11, color: '#6b7280' }}>{pct}% complete</Text>
				</div>
			),
		},
		{
			title: 'Status',
			key: 'status',
			align: 'center',
			width: 110,
			render: (_: any, record: Enrollment) => {
				if (record.completionPercentage === 100) {
					return (
						<Tag icon={<CheckCircleOutlined />} color='success'>
							Completed
						</Tag>
					);
				}
				return (
					<Tag icon={<ClockCircleOutlined />} color='processing'>
						In Progress
					</Tag>
				);
			},
		},
		{
			title: 'Certificate',
			dataIndex: 'certificateIssued',
			key: 'cert',
			align: 'center',
			width: 100,
			render: (issued: boolean) =>
				issued ? (
					<Tag color='gold'>Issued</Tag>
				) : (
					<Tag color='default'>—</Tag>
				),
		},
		{
			title: 'Enrolled',
			dataIndex: 'enrolledAt',
			key: 'enrolledAt',
			align: 'center',
			width: 110,
			render: (d: string) => new Date(d).toLocaleDateString('vi-VN'),
		},
		{
			title: 'Last Access',
			dataIndex: 'lastAccessedAt',
			key: 'lastAccess',
			align: 'center',
			width: 110,
			render: (d: string) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—'),
		},
	];

	return (
		<div>
			<PageHeader
				title='Enrollments'
				total={pagination?.total}
				actions={
					<Space wrap>
						<Input
							placeholder='Search student name or email...'
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							onPressEnter={handleSearch}
							style={{ width: 260 }}
							suffix={
								<SearchOutlined
									style={{ color: '#aaa', cursor: 'pointer' }}
									onClick={handleSearch}
								/>
							}
						/>
						<Button icon={<SyncOutlined />} onClick={() => refetch()}>
							Refresh
						</Button>
					</Space>
				}
			/>

			<DataTable
				scroll={{ x: 1200 }}
				columns={columns}
				dataSource={data || []}
				loading={loading}
				rowKey='_id'
				tableLayout='fixed'
				pagination={{ current: page, pageSize, total: pagination?.total || 0 }}
				onChange={(p) => {
					setPage(p.current || 1);
					setPageSize(p.pageSize || 10);
				}}
			/>
		</div>
	);
};

export default Enrollments;
