import { Announcement, announcementsApi } from '@/api/announcements';
import DataTable from '@/components/datatable/DataTable';
import PageHeader from '@/components/page-header/PageHeader';
import { FormModal, useFormModal } from '@/components/modal';
import { usePaginatedFetch } from '@/hooks/useFetch';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Popconfirm, Select, Space, Tag, Tooltip, message } from 'antd';
import { TableColumnType } from 'antd';
import { useRef } from 'react';

const typeColorMap: Record<string, string> = {
	info: 'processing',
	warning: 'warning',
	success: 'success',
	error: 'error',
	maintenance: 'orange',
	feature: 'purple',
};

const statusColorMap: Record<string, string> = {
	draft: 'default',
	scheduled: 'blue',
	active: 'success',
	expired: 'error',
	archived: 'default',
};

const Announcements = () => {
	const { data, pagination, loading, refetch, page, pageSize, setPage, setPageSize } =
		usePaginatedFetch<Announcement>('announcements', (params) => announcementsApi.getAnnouncements(params));
	const [state, actions] = useFormModal();
	const [form] = Form.useForm();
	const formInitialValues = useRef<Record<string, any>>({});

	const handleAddClick = () => {
		form.resetFields();
		formInitialValues.current = {};
		actions.openModal();
	};

	const handleEditClick = (record: Announcement) => {
		const initialValues = {
			title: record.title,
			content: record.content,
			type: record.type,
			priority: record.priority,
			status: record.status,
			targetScope: record.targetAudience?.scope,
		};
		formInitialValues.current = initialValues;
		form.setFieldsValue(initialValues);
		actions.openModal({ ...record });
		actions.setDirty(false);
	};

	const handleDelete = async (id: string) => {
		try {
			actions.setLoading(true);
			await announcementsApi.deleteAnnouncement(id);
			message.success('Announcement deleted successfully');
			refetch();
		} catch (err: any) {
			message.error(err?.message || 'Failed to delete announcement');
		} finally {
			actions.setLoading(false);
		}
	};

	const handleToggleActive = async (record: Announcement, e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			if (record.status === 'active') {
				await announcementsApi.deactivateAnnouncement(record._id);
				message.success('Announcement deactivated');
			} else {
				await announcementsApi.activateAnnouncement(record._id);
				message.success('Announcement activated');
			}
			refetch();
		} catch (err: any) {
			message.error(err?.message || 'Failed to update status');
		}
	};

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			actions.setLoading(true);
			const payload = {
				title: values.title,
				content: values.content,
				type: values.type,
				priority: values.priority,
				status: values.status,
				targetAudience: {
					scope: values.targetScope,
				},
			};
			if (state.data?._id) {
				await announcementsApi.updateAnnouncement(state.data._id, payload);
				message.success('Announcement updated successfully');
			} else {
				await announcementsApi.createAnnouncement(payload);
				message.success('Announcement created successfully');
			}
			refetch();
			actions.closeModal();
		} catch (err: any) {
			message.error(err?.message || 'Failed to save announcement');
		} finally {
			actions.setLoading(false);
		}
	};

	const columns: TableColumnType<Announcement>[] = [
		{
			title: 'Index',
			key: 'index',
			align: 'center',
			width: 60,
			render: (_: any, __: any, index: number) => (page - 1) * pageSize + index + 1,
		},
		{
			title: 'Title',
			dataIndex: 'title',
			key: 'title',
			fixed: 'left',
			width: 220,
			render: (text: string) => <strong>{text}</strong>,
		},
		{
			title: 'Type',
			dataIndex: 'type',
			key: 'type',
			width: 110,
			align: 'center',
			render: (type: string) => <Tag color={typeColorMap[type] || 'default'}>{type?.toUpperCase()}</Tag>,
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
			title: 'Target',
			dataIndex: ['targetAudience', 'scope'],
			key: 'target',
			width: 90,
			align: 'center',
			render: (scope: string) => <Tag>{scope?.toUpperCase() || 'ALL'}</Tag>,
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			width: 110,
			align: 'center',
			render: (status: string, record: Announcement) => (
				<Tooltip title={status === 'active' ? 'Click to deactivate' : 'Click to activate'}>
					<Tag
						color={statusColorMap[status] || 'default'}
						style={{ cursor: ['draft', 'active'].includes(status) ? 'pointer' : 'default' }}
						onClick={(e) =>
							['draft', 'scheduled', 'active'].includes(status)
								? handleToggleActive(record, e)
								: undefined
						}
					>
						{status?.toUpperCase()}
					</Tag>
				</Tooltip>
			),
		},
		{
			title: 'Created At',
			dataIndex: 'createdAt',
			key: 'createdAt',
			align: 'center',
			width: 120,
			render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
		},
		{
			title: 'Actions',
			key: 'actions',
			align: 'center',
			fixed: 'right',
			width: 90,
			render: (record: Announcement) => (
				<Space onClick={(e) => e.stopPropagation()}>
					<Button type='text' icon={<EditOutlined />} size='small' onClick={() => handleEditClick(record)} />
					<Popconfirm
						title='Delete Announcement'
						description='Are you sure you want to delete this announcement?'
						onConfirm={() => handleDelete(record._id)}
						okText='Yes'
						cancelText='No'
						okButtonProps={{ danger: true }}
					>
						<Button type='text' danger icon={<DeleteOutlined />} size='small' />
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div>
			<PageHeader
				title='Announcements'
				total={pagination?.total}
				actions={
					<div className='actions'>
						<Button onClick={() => refetch()}>Refresh</Button>
						<Button icon={<PlusOutlined />} type='primary' onClick={handleAddClick}>
							Add Announcement
						</Button>
					</div>
				}
			/>

			<DataTable
				scroll={{ x: 1000 }}
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
				onRow={(record) => ({ onClick: () => handleEditClick(record), style: { cursor: 'pointer' } })}
			/>

			<FormModal
				isOpen={state.isOpen}
				title={state.data?._id ? 'Edit Announcement' : 'Add Announcement'}
				isDirty={state.isDirty}
				onClose={actions.closeModal}
				onSubmit={handleSubmit}
				loading={state.loading}
				okText={state.data?._id ? 'Update' : 'Create'}
			>
				<Form form={form} layout='vertical' onValuesChange={() => actions.setDirty(true)}>
					<Form.Item name='title' label='Title' rules={[{ required: true, message: 'Please enter title' }]}>
						<Input placeholder='Announcement title' />
					</Form.Item>
					<Form.Item
						name='content'
						label='Content'
						rules={[{ required: true, message: 'Please enter content' }]}
					>
						<Input.TextArea rows={4} placeholder='Announcement content...' />
					</Form.Item>
					<Form.Item name='type' label='Type' rules={[{ required: true }]} initialValue='info'>
						<Select>
							<Select.Option value='info'>Info</Select.Option>
							<Select.Option value='warning'>Warning</Select.Option>
							<Select.Option value='success'>Success</Select.Option>
							<Select.Option value='error'>Error</Select.Option>
							<Select.Option value='maintenance'>Maintenance</Select.Option>
							<Select.Option value='feature'>Feature</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item name='priority' label='Priority' rules={[{ required: true }]} initialValue='medium'>
						<Select>
							<Select.Option value='low'>Low</Select.Option>
							<Select.Option value='medium'>Medium</Select.Option>
							<Select.Option value='high'>High</Select.Option>
							<Select.Option value='urgent'>Urgent</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item
						name='targetScope'
						label='Target Audience'
						rules={[{ required: true, message: 'Please select audience' }]}
						initialValue='all'
					>
						<Select>
							<Select.Option value='all'>All</Select.Option>
							<Select.Option value='role'>By Role</Select.Option>
							<Select.Option value='course'>By Course</Select.Option>
							<Select.Option value='user'>Specific Users</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item name='status' label='Status' rules={[{ required: true }]} initialValue='draft'>
						<Select>
							<Select.Option value='draft'>Draft</Select.Option>
							<Select.Option value='scheduled'>Scheduled</Select.Option>
							<Select.Option value='active'>Active</Select.Option>
							<Select.Option value='archived'>Archived</Select.Option>
						</Select>
					</Form.Item>
				</Form>
			</FormModal>
		</div>
	);
};

export default Announcements;
