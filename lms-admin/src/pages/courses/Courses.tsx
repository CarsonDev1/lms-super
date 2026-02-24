import { CourseApproval, courseApprovalsApi } from '@/api/courses';
import DataTable from '@/components/datatable/DataTable';
import PageHeader from '@/components/page-header/PageHeader';
import { usePaginatedFetch } from '@/hooks/useFetch';
import { BookOutlined, CheckCircleOutlined, CloseCircleOutlined, EditOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Popconfirm, Space, Tag, Tooltip, message } from 'antd';
import { TableColumnType } from 'antd';
import { useState } from 'react';

const statusColorMap: Record<string, string> = {
	pending: 'warning',
	under_review: 'processing',
	approved: 'success',
	rejected: 'error',
	revision_required: 'orange',
};

const Courses = () => {
	const { data, pagination, loading, refetch, page, pageSize, setPage, setPageSize } =
		usePaginatedFetch<CourseApproval>('course-approvals', (params) => courseApprovalsApi.getApprovals(params));

	const [actionModal, setActionModal] = useState<{
		open: boolean;
		type: 'approve' | 'reject' | 'revision' | null;
		approval: CourseApproval | null;
	}>({ open: false, type: null, approval: null });
	const [actionLoading, setActionLoading] = useState(false);
	const [form] = Form.useForm();

	const openAction = (type: 'approve' | 'reject' | 'revision', approval: CourseApproval) => {
		form.resetFields();
		setActionModal({ open: true, type, approval });
	};

	const handleAction = async () => {
		const values = await form.validateFields();
		const { type, approval } = actionModal;
		if (!approval) return;
		setActionLoading(true);
		try {
			if (type === 'approve') {
				await courseApprovalsApi.approveCourse(approval._id, { notes: values.notes });
				message.success('Course approved successfully');
			} else if (type === 'reject') {
				await courseApprovalsApi.rejectCourse(approval._id, { reason: values.reason, notes: values.notes });
				message.success('Course rejected');
			} else if (type === 'revision') {
				await courseApprovalsApi.requestRevision(approval._id, { feedback: values.feedback });
				message.success('Revision requested');
			}
			refetch();
			setActionModal({ open: false, type: null, approval: null });
		} catch (err: any) {
			message.error(err?.message || 'Action failed');
		} finally {
			setActionLoading(false);
		}
	};

	const columns: TableColumnType<CourseApproval>[] = [
		{
			title: 'Index',
			key: 'index',
			align: 'center',
			width: 60,
			render: (_: any, __: any, index: number) => (page - 1) * pageSize + index + 1,
		},
		{
			title: 'Thumbnail',
			dataIndex: ['courseId', 'thumbnail'],
			key: 'thumbnail',
			align: 'center',
			fixed: 'left',
			width: 100,
			render: (url: string | undefined) =>
				url ? (
					<img
						src={url}
						alt='Thumbnail'
						style={{ width: 60, height: 40, borderRadius: '4px', objectFit: 'cover' }}
					/>
				) : (
					<div
						style={{
							borderRadius: '4px',
							background: '#f0f0f0',
							width: 60,
							height: 40,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							margin: '0 auto',
						}}
					>
						<BookOutlined style={{ color: '#aaa', fontSize: '18px' }} />
					</div>
				),
		},
		{
			title: 'Course Title',
			dataIndex: ['courseId', 'title'],
			fixed: 'left',
			key: 'title',
			width: 250,
			render: (text: string) => <strong>{text || 'Unknown Course'}</strong>,
		},
		{
			title: 'Submitted By',
			dataIndex: ['submittedBy', 'name'],
			key: 'submittedBy',
			width: 150,
			render: (text: string) => <span>{text || 'N/A'}</span>,
		},
		{
			title: 'Type',
			dataIndex: 'submissionType',
			key: 'submissionType',
			width: 90,
			align: 'center',
			render: (type: string) => <Tag color='blue'>{type?.toUpperCase()}</Tag>,
		},
		{
			title: 'Priority',
			dataIndex: 'priority',
			key: 'priority',
			width: 90,
			align: 'center',
			render: (priority: string) => {
				const colorMap: Record<string, string> = {
					low: 'default',
					medium: 'processing',
					high: 'warning',
					urgent: 'error',
				};
				return <Tag color={colorMap[priority] || 'default'}>{priority?.toUpperCase()}</Tag>;
			},
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			width: 130,
			align: 'center',
			render: (status: string) => (
				<Tag color={statusColorMap[status] || 'default'}>{status?.toUpperCase().replace(/_/g, ' ')}</Tag>
			),
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
			title: 'Actions',
			key: 'actions',
			align: 'center',
			fixed: 'right',
			width: 120,
			render: (approval: CourseApproval) => {
				const isPending = ['pending', 'under_review'].includes(approval.status);
				return (
					<Space onClick={(e) => e.stopPropagation()}>
						<Tooltip title='Approve'>
							<Button
								type='text'
								size='small'
								icon={<CheckCircleOutlined style={{ color: isPending ? '#52c41a' : '#ccc' }} />}
								disabled={!isPending}
								onClick={() => openAction('approve', approval)}
							/>
						</Tooltip>
						<Tooltip title='Request Revision'>
							<Button
								type='text'
								size='small'
								icon={<EditOutlined style={{ color: isPending ? '#fa8c16' : '#ccc' }} />}
								disabled={!isPending}
								onClick={() => openAction('revision', approval)}
							/>
						</Tooltip>
						<Tooltip title='Reject'>
							<Popconfirm
								title='Reject this course?'
								description='This will notify the instructor.'
								onConfirm={() => openAction('reject', approval)}
								okText='Proceed'
								cancelText='Cancel'
								okButtonProps={{ danger: true }}
								disabled={!isPending}
							>
								<Button
									type='text'
									size='small'
									danger
									icon={<CloseCircleOutlined />}
									disabled={!isPending}
								/>
							</Popconfirm>
						</Tooltip>
					</Space>
				);
			},
		},
	];

	return (
		<div>
			<PageHeader
				title='Course Approvals'
				total={pagination?.total}
				actions={
					<Button onClick={() => refetch()} icon={<SyncOutlined />}>
						Refresh
					</Button>
				}
			/>

			<DataTable
				scroll={{ x: 1300 }}
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

			{/* Action Modal */}
			<Modal
				open={actionModal.open}
				title={
					actionModal.type === 'approve'
						? '✅ Approve Course'
						: actionModal.type === 'reject'
							? '❌ Reject Course'
							: '📝 Request Revision'
				}
				onCancel={() => setActionModal({ open: false, type: null, approval: null })}
				onOk={handleAction}
				confirmLoading={actionLoading}
				okText={
					actionModal.type === 'approve'
						? 'Approve'
						: actionModal.type === 'reject'
							? 'Reject'
							: 'Send Request'
				}
				okButtonProps={{ danger: actionModal.type === 'reject' }}
				style={{ top: 20 }}
			>
				<p style={{ color: '#6b7280', marginBottom: 16 }}>
					Course: <strong>{actionModal.approval?.courseId?.title}</strong>
				</p>
				<Form form={form} layout='vertical'>
					{actionModal.type === 'reject' && (
						<Form.Item
							name='reason'
							label='Rejection Reason'
							rules={[{ required: true, message: 'Please enter a reason' }]}
						>
							<Input.TextArea rows={3} placeholder='Why is this course being rejected?' />
						</Form.Item>
					)}
					{actionModal.type === 'revision' && (
						<Form.Item
							name='feedback'
							label='Feedback for Instructor'
							rules={[{ required: true, message: 'Please enter feedback' }]}
						>
							<Input.TextArea rows={3} placeholder='What needs to be revised?' />
						</Form.Item>
					)}
					<Form.Item
						name='notes'
						label={actionModal.type === 'approve' ? 'Notes (optional)' : 'Additional Notes (optional)'}
					>
						<Input.TextArea rows={2} placeholder='Optional additional notes...' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default Courses;
