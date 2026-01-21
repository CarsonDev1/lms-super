import './Categories.scss';
import { useRef, useState } from 'react';
import { categoriesApi, Category } from '@/api/categories';
import { useFetch } from '@/hooks/useFetch';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Space, Form, Input, message, Popconfirm } from 'antd';
import PageHeader from '@/components/page-header/PageHeader';
import DataTable from '@/components/datatable/DataTable';
import FormModal from '@/components/modal/FormModal';
import { useFormModal } from '@/components/modal';

const Categories = () => {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const { data, pagination, loading, error, refetch } = useFetch<Category>(
		'categories',
		() => categoriesApi.getCategories({ page, limit: pageSize }),
		undefined,
		[page, pageSize],
	);

	const [state, actions] = useFormModal();
	const [form] = Form.useForm();
	const formInitialValues = useRef<Record<string, any>>({});

	const handleTableChange = (paginationConfig: any) => {
		if (paginationConfig.current !== page) {
			setPage(paginationConfig.current);
		}
		if (paginationConfig.pageSize !== pageSize) {
			setPageSize(paginationConfig.pageSize);
			setPage(1);
		}
	};

	if (error) return <div>Error: {error.message}</div>;

	const handleAddClick = () => {
		form.resetFields();
		formInitialValues.current = {};
		actions.openModal();
	};

	const handleEditClick = (record: Category) => {
		const initialValues = {
			name: record.name,
		};
		formInitialValues.current = initialValues;
		form.setFieldsValue(initialValues);
		actions.openModal({ ...record });
		actions.setDirty(false);
	};

	const handleDelete = async (record: Category) => {
		try {
			actions.setLoading(true);
			await categoriesApi.deleteCategory(record._id);
			message.success('Category deleted successfully');
			refetch();
		} catch (error: any) {
			message.error(error?.message || 'Failed to delete category');
		} finally {
			actions.setLoading(false);
		}
	};

	const handleFormChange = () => {
		const currentValues = form.getFieldsValue();
		const isDirty = JSON.stringify(currentValues) !== JSON.stringify(formInitialValues.current);
		actions.setDirty(isDirty);
	};

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			actions.setLoading(true);

			if (state.data?._id) {
				await categoriesApi.updateCategory(state.data._id, values);
				message.success('Category updated successfully');
			} else {
				await categoriesApi.createCategory(values);
				message.success('Category created successfully');
			}

			refetch();
			actions.closeModal();
		} catch (error: any) {
			message.error(error?.message || 'Failed to save category');
		} finally {
			actions.setLoading(false);
		}
	};

	const columns = [
		{
			title: 'Index',
			dataIndex: 'index',
			key: 'index',
			width: 20,
			render: (_: any, __: any, index: number) => (page - 1) * pageSize + index + 1,
		},
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
			width: 200,
			render: (text: string) => <strong>{text}</strong>,
		},
		{
			title: 'Created At',
			dataIndex: 'createdAt',
			key: 'createdAt',
			width: 180,
			render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
		},
		{
			title: 'Actions',
			key: 'actions',
			width: 150,
			render: (_: any, record: Category) => (
				<Space>
					<Button type='text' icon={<EditOutlined />} size='small' onClick={() => handleEditClick(record)} />
					<Popconfirm
						title='Delete Category'
						description='Are you sure you want to delete this category?'
						onConfirm={() => handleDelete(record)}
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

	const pageActions = (
		<div className='actions'>
			<Button onClick={() => refetch()}>Refresh</Button>
			<Button icon={<PlusOutlined />} type='primary' className='btn-primary' onClick={handleAddClick}>
				Add Category
			</Button>
		</div>
	);

	return (
		<div className='categories-page'>
			<PageHeader title='Categories' total={pagination?.total} actions={pageActions} />

			<DataTable
				columns={columns}
				dataSource={data || []}
				loading={loading}
				rowKey='_id'
				pagination={{
					current: page,
					pageSize: pageSize,
					total: pagination?.total || 0,
				}}
				onChange={handleTableChange}
			/>

			<FormModal
				isOpen={state.isOpen}
				title={state.data?._id ? 'Edit Category' : 'Add Category'}
				isDirty={state.isDirty}
				onClose={actions.closeModal}
				onSubmit={handleSubmit}
				loading={state.loading}
				okText={state.data?._id ? 'Update' : 'Create'}
			>
				<Form
					form={form}
					layout='vertical'
					onValuesChange={handleFormChange}
					initialValues={{
						name: '',
						isActive: true,
					}}
				>
					<Form.Item
						name='name'
						label='Category Name'
						rules={[
							{ required: true, message: 'Please enter category name' },
							{ min: 3, message: 'Name must be at least 3 characters' },
						]}
					>
						<Input placeholder='Enter category name' />
					</Form.Item>
				</Form>
			</FormModal>
		</div>
	);
};

export default Categories;
