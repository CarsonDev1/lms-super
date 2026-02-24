import { AuditLog, auditLogsApi } from '@/api/auditLogs';
import DataTable from '@/components/datatable/DataTable';
import PageHeader from '@/components/page-header/PageHeader';
import { usePaginatedFetch } from '@/hooks/useFetch';
import { SyncOutlined } from '@ant-design/icons';
import { Button, Tag, Tooltip } from 'antd';
import { TableColumnType } from 'antd';

const AuditLogs = () => {
	const { data, pagination, loading, refetch, page, pageSize, setPage, setPageSize } = usePaginatedFetch<AuditLog>(
		'audit-logs',
		(params) => auditLogsApi.getAuditLogs(params),
	);

	const actionColorMap: Record<string, string> = {
		create: 'success',
		update: 'processing',
		delete: 'error',
		login: 'blue',
		logout: 'default',
		approve: 'green',
		reject: 'red',
		block: 'warning',
		unblock: 'cyan',
	};

	const columns: TableColumnType<AuditLog>[] = [
		{
			title: 'Index',
			key: 'index',
			align: 'center',
			width: 60,
			render: (_: any, __: any, index: number) => (page - 1) * pageSize + index + 1,
		},
		{
			title: 'User',
			dataIndex: ['userId', 'name'],
			key: 'user',
			width: 160,
			render: (name: string, record: AuditLog) => (
				<div>
					<strong>{name || 'System'}</strong>
					<br />
					<span style={{ fontSize: 12, color: '#6b7280' }}>{record.userId?.email}</span>
				</div>
			),
		},
		{
			title: 'Action',
			dataIndex: 'action',
			key: 'action',
			width: 120,
			align: 'center',
			render: (action: string) => {
				const key = action?.toLowerCase().split('_')[0];
				return <Tag color={actionColorMap[key] || 'default'}>{action?.toUpperCase().replace(/_/g, ' ')}</Tag>;
			},
		},
		{
			title: 'Resource',
			dataIndex: 'resourceType',
			key: 'resourceType',
			width: 120,
			align: 'center',
			render: (type: string) => <Tag>{type || '—'}</Tag>,
		},
		{
			title: 'IP Address',
			dataIndex: 'ipAddress',
			key: 'ipAddress',
			width: 130,
			align: 'center',
			render: (ip: string) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{ip || '—'}</span>,
		},
		{
			title: 'Details',
			dataIndex: 'details',
			key: 'details',
			width: 200,
			render: (details: any) => {
				if (!details) return '—';
				const text = JSON.stringify(details);
				return (
					<Tooltip title={text}>
						<span style={{ fontSize: 12, color: '#6b7280' }}>
							{text.length > 60 ? text.slice(0, 60) + '…' : text}
						</span>
					</Tooltip>
				);
			},
		},
		{
			title: 'Date',
			dataIndex: 'createdAt',
			key: 'createdAt',
			align: 'center',
			width: 130,
			render: (date: string) =>
				new Date(date).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }),
		},
	];

	return (
		<div>
			<PageHeader
				title='Audit Logs'
				total={pagination?.total}
				actions={
					<Button icon={<SyncOutlined />} onClick={() => refetch()}>
						Refresh
					</Button>
				}
			/>

			<DataTable
				scroll={{ x: 1000 }}
				columns={columns}
				dataSource={data || []}
				loading={loading}
				rowKey='_id'
				pagination={{ current: page, pageSize, total: pagination?.total || 0 }}
				tableLayout='fixed'
				onChange={(p) => {
					setPage(p.current || 1);
					setPageSize(p.pageSize || 10);
				}}
			/>
		</div>
	);
};

export default AuditLogs;
