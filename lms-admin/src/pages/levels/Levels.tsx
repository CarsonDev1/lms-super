import { Level, levelsApi } from '@/api/levels';
import DataTable from '@/components/datatable/DataTable';
import PageHeader from '@/components/page-header/PageHeader';
import { usePaginatedFetch } from '@/hooks/useFetch';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Popconfirm, Space, Tag, Tooltip, message } from 'antd';
import { TableColumnType } from 'antd';
import { FormModal, useFormModal } from '@/components/modal';

const Levels = () => {
	const { data, pagination, loading, refetch, page, pageSize, setPage, setPageSize } = usePaginatedFetch<Level>(
		'levels',
		(params) =>
			levelsApi.getLevels(params).then((res: any) => {
				// Backend returns { data: { levels: [], pagination: {} } }
				// We need to reshape it to match usePaginatedFetch expectations
				const raw = res?.data || res;
				if (raw?.levels) {
					return {
						data: {
							data: raw.levels,
							pagination: raw.pagination,
						},
					};
				}
				return res;
			}),
	);

	const [state, actions] = useFormModal();
	const [form] = Form.useForm();

	const handleAdd = () => {
		form.resetFields();
		actions.openModal();
	};

	const handleEdit = (record: Level) => {
		form.setFieldsValue({
			name: record.name,
			description: record.description,
		});
		actions.openModal({ ...record });
		actions.setDirty(false);
	};

	const handleDelete = async (id: string) => {
		try {
			await levelsApi.deleteLevel(id);
			message.success('Level deleted');
			refetch();
		} catch (err: any) {
			message.error(err?.message || 'Failed to delete level');
		}
	};

	const handleSave = async () => {
		try {
			const values = await form.validateFields();
			actions.setLoading(true);
			if (state.data?._id) {
				await levelsApi.updateLevel(state.data._id, {
					name: values.name,
					description: values.description,
				});
				message.success('Level updated');
			} else {
				// order is auto-assigned by backend
				await levelsApi.createLevel({
					name: values.name,
					description: values.description,
				});
				message.success('Level created');
			}
			refetch();
			actions.closeModal();
		} catch (err: any) {
			const msg = err?.response?.data?.message || err?.message || 'Failed to save level';
			message.error(msg);
		} finally {
			actions.setLoading(false);
		}
	};

	const columns: TableColumnType<Level>[] = [
		{
			title: '#',
			dataIndex: 'order',
			key: 'order',
			align: 'center',
			width: 60,
			sorter: (a: Level, b: Level) => (a.order ?? 0) - (b.order ?? 0),
			render: (v: number) => <Tag style={{ minWidth: 28, textAlign: 'center' }}>{v ?? '—'}</Tag>,
		},
		{
			title: 'Level Name',
			dataIndex: 'name',
			key: 'name',
			render: (text: string) => <strong>{text}</strong>,
		},
		{
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
			render: (text: string) => text || <span style={{ color: '#aaa' }}>No description</span>,
		},
		{
			title: 'Created At',
			dataIndex: 'createdAt',
			key: 'createdAt',
			align: 'center',
			width: 120,
			render: (d: string) => new Date(d).toLocaleDateString('vi-VN'),
		},
		{
			title: 'Actions',
			key: 'actions',
			align: 'center',
			fixed: 'right',
			width: 100,
			render: (record: Level) => (
				<Space onClick={(e) => e.stopPropagation()}>
					<Tooltip title='Edit'>
						<Button type='text' size='small' icon={<EditOutlined />} onClick={() => handleEdit(record)} />
					</Tooltip>
					<Popconfirm
						title='Delete Level'
						description='Courses using this level may be affected.'
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
				title='Levels'
				total={pagination?.total}
				actions={
					<div className='actions'>
						<Button onClick={() => refetch()}>Refresh</Button>
						<Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
							Add Level
						</Button>
					</div>
				}
			/>

			<DataTable
				columns={columns}
				dataSource={data || []}
				loading={loading}
				rowKey='_id'
				pagination={{ current: page, pageSize, total: pagination?.total || 0 }}
				onChange={(p) => {
					setPage(p.current || 1);
					setPageSize(p.pageSize || 10);
				}}
				onRow={(record) => ({
					onClick: () => handleEdit(record),
					style: { cursor: 'pointer' },
				})}
			/>

			<FormModal
				isOpen={state.isOpen}
				title={state.data?._id ? 'Edit Level' : 'Add Level'}
				isDirty={state.isDirty}
				onClose={actions.closeModal}
				onSubmit={handleSave}
				loading={state.loading}
				okText={state.data?._id ? 'Save Changes' : 'Create Level'}
			>
				<Form form={form} layout='vertical' onValuesChange={() => actions.setDirty(true)}>
					<Form.Item
						name='name'
						label='Level Name'
						rules={[
							{ required: true, message: 'Please enter level name' },
							{ min: 2, message: 'At least 2 characters' },
						]}
					>
						<Input placeholder='e.g. Beginner' />
					</Form.Item>
					<Form.Item name='description' label='Description'>
						<Input.TextArea rows={3} placeholder='Describe this difficulty level...' />
					</Form.Item>
					{/* order is auto-assigned by backend */}
					{state.data?._id && (
						<p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>
							📌 Current order: <strong>{state.data?.order}</strong> — order is managed automatically.
						</p>
					)}
				</Form>
			</FormModal>
		</div>
	);
};

export default Levels;
