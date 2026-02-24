import { CmsPage, cmsApi } from '@/api/cms';
import DataTable from '@/components/datatable/DataTable';
import PageHeader from '@/components/page-header/PageHeader';
import { usePaginatedFetch } from '@/hooks/useFetch';
import { DeleteOutlined, EditOutlined, GlobalOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Popconfirm, Select, Space, Switch, Tag, Tooltip, message } from 'antd';
import { TableColumnType } from 'antd';
import { FormModal, useFormModal } from '@/components/modal';

const CmsPages = () => {
	const { data, pagination, loading, refetch, page, pageSize, setPage, setPageSize } = usePaginatedFetch<CmsPage>(
		'cms-pages',
		(params) => cmsApi.getPages(params),
	);

	const [state, actions] = useFormModal();
	const [form] = Form.useForm();

	const handleAdd = () => {
		form.resetFields();
		actions.openModal();
	};

	const handleEdit = (record: CmsPage) => {
		form.setFieldsValue({
			title: record.title,
			slug: record.slug,
			content: record.content,
			metaTitle: record.metaTitle,
			metaDescription: record.metaDescription,
			showInMenu: record.showInMenu,
			order: record.order,
		});
		actions.openModal({ ...record });
		actions.setDirty(false);
	};

	const handleDelete = async (id: string) => {
		try {
			await cmsApi.deletePage(id);
			message.success('Page deleted');
			refetch();
		} catch (err: any) {
			message.error(err?.message || 'Failed to delete page');
		}
	};

	const handleTogglePublish = async (record: CmsPage) => {
		try {
			if (record.status === 'published') {
				await cmsApi.unpublishPage(record._id);
				message.success('Page unpublished');
			} else {
				await cmsApi.publishPage(record._id);
				message.success('Page published');
			}
			refetch();
		} catch (err: any) {
			message.error(err?.message || 'Failed to update status');
		}
	};

	const handleSave = async () => {
		try {
			const values = await form.validateFields();
			actions.setLoading(true);
			if (state.data?._id) {
				await cmsApi.updatePage(state.data._id, values);
				message.success('Page updated');
			} else {
				await cmsApi.createPage(values);
				message.success('Page created');
			}
			refetch();
			actions.closeModal();
		} catch (err: any) {
			message.error(err?.message || 'Failed to save page');
		} finally {
			actions.setLoading(false);
		}
	};

	const columns: TableColumnType<CmsPage>[] = [
		{
			title: 'Index',
			key: 'index',
			align: 'center',
			width: 80,
			render: (_: any, __: any, index: number) => (page - 1) * pageSize + index + 1,
		},
		{
			title: 'Title',
			dataIndex: 'title',
			key: 'title',
			fixed: 'left',
			render: (text: string) => <strong>{text}</strong>,
		},
		{
			title: 'Slug',
			dataIndex: 'slug',
			key: 'slug',
			render: (s: string) => <code style={{ fontSize: 12, color: '#1890ff' }}>/{s}</code>,
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			align: 'center',
			width: 140,
			render: (status: string) => {
				const colorMap: Record<string, string> = {
					published: 'success',
					draft: 'default',
					archived: 'warning',
				};
				return <Tag color={colorMap[status] || 'default'}>{status?.toUpperCase()}</Tag>;
			},
		},
		{
			title: 'In Menu',
			dataIndex: 'showInMenu',
			key: 'showInMenu',
			align: 'center',
			width: 120,
			render: (v: boolean) => (v ? <Tag color='blue'>Yes</Tag> : <Tag>No</Tag>),
		},
		{
			title: 'Order',
			dataIndex: 'order',
			key: 'order',
			align: 'center',
			width: 120,
			render: (v: number) => v ?? '—',
		},
		{
			title: 'Updated At',
			dataIndex: 'updatedAt',
			key: 'updatedAt',
			align: 'center',
			width: 120,
			render: (d: string) => new Date(d).toLocaleDateString('vi-VN'),
		},
		{
			title: 'Actions',
			key: 'actions',
			align: 'center',
			fixed: 'right',
			width: 120,
			render: (record: CmsPage) => (
				<Space onClick={(e) => e.stopPropagation()}>
					<Tooltip title='Edit'>
						<Button type='text' size='small' icon={<EditOutlined />} onClick={() => handleEdit(record)} />
					</Tooltip>
					<Tooltip title={record.status === 'published' ? 'Unpublish' : 'Publish'}>
						<Button
							type='text'
							size='small'
							icon={
								record.status === 'published' ? (
									<StopOutlined style={{ color: '#faad14' }} />
								) : (
									<GlobalOutlined style={{ color: '#52c41a' }} />
								)
							}
							onClick={() => handleTogglePublish(record)}
						/>
					</Tooltip>
					<Popconfirm
						title='Delete Page'
						description='This action cannot be undone.'
						onConfirm={() => handleDelete(record._id)}
						okText='Delete'
						cancelText='Cancel'
						okButtonProps={{ danger: true }}
					>
						<Button type='text' danger size='small' icon={<DeleteOutlined />} />
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div>
			<PageHeader
				title='CMS Pages'
				total={pagination?.total}
				actions={
					<div className='actions'>
						<Button onClick={() => refetch()}>Refresh</Button>
						<Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
							New Page
						</Button>
					</div>
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
				onRow={(record) => ({ onClick: () => handleEdit(record), style: { cursor: 'pointer' } })}
			/>

			<FormModal
				isOpen={state.isOpen}
				title={state.data?._id ? 'Edit Page' : 'Create New Page'}
				isDirty={state.isDirty}
				onClose={actions.closeModal}
				onSubmit={handleSave}
				loading={state.loading}
				okText={state.data?._id ? 'Save Changes' : 'Create Page'}
			>
				<Form form={form} layout='vertical' onValuesChange={() => actions.setDirty(true)}>
					<Form.Item
						name='title'
						label='Page Title'
						rules={[{ required: true, message: 'Please enter title' }]}
					>
						<Input placeholder='About Us' />
					</Form.Item>

					<div style={{ display: 'flex', gap: 12 }}>
						<Form.Item
							name='slug'
							label='URL Slug'
							rules={[{ required: true, message: 'Please enter slug' }]}
							style={{ flex: 1 }}
						>
							<Input placeholder='about-us' addonBefore='/' />
						</Form.Item>
						<Form.Item name='type' label='Page Type' initialValue='page' style={{ flex: 1 }}>
							<Select>
								<Select.Option value='page'>Page</Select.Option>
								<Select.Option value='faq'>FAQ</Select.Option>
								<Select.Option value='policy'>Policy</Select.Option>
								<Select.Option value='about'>About</Select.Option>
								<Select.Option value='terms'>Terms</Select.Option>
								<Select.Option value='privacy'>Privacy</Select.Option>
							</Select>
						</Form.Item>
					</div>

					<Form.Item
						name='content'
						label='Content'
						rules={[{ required: true, message: 'Please enter content' }]}
					>
						<Input.TextArea rows={6} placeholder='Page content (HTML or Markdown)...' />
					</Form.Item>
					<Form.Item name='metaTitle' label='Meta Title'>
						<Input placeholder='SEO title (optional)' />
					</Form.Item>
					<Form.Item name='metaDescription' label='Meta Description'>
						<Input.TextArea rows={2} placeholder='SEO description (optional)' />
					</Form.Item>
					<div style={{ display: 'flex', gap: 16 }}>
						<Form.Item
							name='showInMenu'
							label='Show in Menu'
							valuePropName='checked'
							initialValue={false}
							style={{ flex: 1 }}
						>
							<Switch />
						</Form.Item>
						<Form.Item name='order' label='Menu Order' style={{ flex: 1 }}>
							<InputNumber min={1} style={{ width: '100%' }} placeholder='1' />
						</Form.Item>
					</div>
				</Form>
			</FormModal>
		</div>
	);
};

export default CmsPages;
