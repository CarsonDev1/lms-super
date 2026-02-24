import { instructorCoursesApi } from '@/api/instructorCourses';
import DataTable from '@/components/datatable/DataTable';
import PageHeader from '@/components/page-header/PageHeader';
import { usePaginatedFetch } from '@/hooks/useFetch';
import { SyncOutlined } from '@ant-design/icons';
import { Button, Tag, Tooltip } from 'antd';
import { TableColumnType } from 'antd';

const statusColorMap: Record<string, string> = {
	pending: 'warning',
	under_review: 'processing',
	approved: 'success',
	rejected: 'error',
	revision_required: 'orange',
};

const MySubmissions = () => {
	const { data, pagination, loading, refetch, page, pageSize, setPage, setPageSize } = usePaginatedFetch<any>(
		'my-submissions',
		(params) => instructorCoursesApi.getMySubmissions(params),
	);

	const columns: TableColumnType<any>[] = [
		{
			title: 'Index',
			key: 'index',
			align: 'center',
			width: 60,
			render: (_: any, __: any, index: number) => (page - 1) * pageSize + index + 1,
		},
		{
			title: 'Course',
			dataIndex: ['courseId', 'title'],
			key: 'course',
			fixed: 'left',
			width: 260,
			render: (text: string) => <strong>{text || 'Unknown Course'}</strong>,
		},
		{
			title: 'Submission Type',
			dataIndex: 'submissionType',
			key: 'submissionType',
			width: 130,
			align: 'center',
			render: (type: string) => <Tag color='blue'>{type?.toUpperCase()}</Tag>,
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			width: 140,
			align: 'center',
			render: (status: string) => (
				<Tag color={statusColorMap[status] || 'default'}>{status?.toUpperCase().replace(/_/g, ' ')}</Tag>
			),
		},
		{
			title: 'Priority',
			dataIndex: 'priority',
			key: 'priority',
			width: 100,
			align: 'center',
			render: (priority: string) => {
				const colors: Record<string, string> = {
					low: 'default',
					medium: 'processing',
					high: 'warning',
					urgent: 'error',
				};
				return <Tag color={colors[priority] || 'default'}>{priority?.toUpperCase()}</Tag>;
			},
		},
		{
			title: 'Reviewer',
			dataIndex: ['reviewedBy', 'name'],
			key: 'reviewer',
			width: 150,
			render: (name: string) => name || <span style={{ color: '#aaa' }}>Not assigned</span>,
		},
		{
			title: 'Feedback',
			key: 'feedback',
			width: 200,
			render: (_: any, record: any) => {
				const lastHistory = record.history?.[record.history.length - 1];
				if (!lastHistory?.notes) return <span style={{ color: '#aaa' }}>—</span>;
				return (
					<Tooltip title={lastHistory.notes}>
						<span style={{ fontSize: 12, color: '#6b7280' }}>
							{lastHistory.notes.length > 60 ? lastHistory.notes.slice(0, 60) + '…' : lastHistory.notes}
						</span>
					</Tooltip>
				);
			},
		},
		{
			title: 'Submitted At',
			dataIndex: 'submittedAt',
			key: 'submittedAt',
			align: 'center',
			width: 120,
			render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
		},
		{
			title: 'Reviewed At',
			dataIndex: 'reviewedAt',
			key: 'reviewedAt',
			align: 'center',
			width: 120,
			render: (date: string) => (date ? new Date(date).toLocaleDateString('vi-VN') : '—'),
		},
	];

	return (
		<div>
			<PageHeader
				title='My Submissions'
				total={pagination?.total}
				actions={
					<Button icon={<SyncOutlined />} onClick={() => refetch()}>
						Refresh
					</Button>
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

export default MySubmissions;
