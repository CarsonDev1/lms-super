import { Coupon, couponsApi } from '@/api/coupons';
import DataTable from '@/components/datatable/DataTable';
import PageHeader from '@/components/page-header/PageHeader';
import { FormModal, useFormModal } from '@/components/modal';
import { usePaginatedFetch } from '@/hooks/useFetch';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, InputNumber, Popconfirm, Select, Space, Switch, Tag, message } from 'antd';
import { TableColumnType } from 'antd';
import dayjs from 'dayjs';
import { useRef } from 'react';

const Coupons = () => {
	const { data, pagination, loading, refetch, page, pageSize, setPage, setPageSize } = usePaginatedFetch<Coupon>(
		'coupons',
		(params) => couponsApi.getCoupons(params),
	);
	const [state, actions] = useFormModal();
	const [form] = Form.useForm();
	const formInitialValues = useRef<Record<string, any>>({});

	const handleAddClick = () => {
		form.resetFields();
		formInitialValues.current = {};
		actions.openModal();
	};

	const handleEditClick = (record: Coupon) => {
		const initialValues = {
			code: record.code,
			description: record.description,
			type: record.type,
			value: record.value,
			maxUses: record.maxUses,
			maxUsesPerUser: record.maxUsesPerUser,
			minimumPurchase: record.minimumPurchase,
			maxDiscount: record.maxDiscount,
			isActive: record.isActive,
			validFrom: record.validFrom ? dayjs(record.validFrom) : null,
			validTo: record.validTo ? dayjs(record.validTo) : null,
		};
		formInitialValues.current = initialValues;
		form.setFieldsValue(initialValues);
		actions.openModal({ ...record });
		actions.setDirty(false);
	};

	const handleDelete = async (id: string) => {
		try {
			actions.setLoading(true);
			await couponsApi.deleteCoupon(id);
			message.success('Coupon deleted successfully');
			refetch();
		} catch (err: any) {
			message.error(err?.message || 'Failed to delete coupon');
		} finally {
			actions.setLoading(false);
		}
	};

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			actions.setLoading(true);
			const payload = {
				...values,
				validFrom: values.validFrom ? values.validFrom.toISOString() : undefined,
				validTo: values.validTo ? values.validTo.toISOString() : undefined,
			};
			if (state.data?._id) {
				await couponsApi.updateCoupon(state.data._id, payload);
				message.success('Coupon updated successfully');
			} else {
				await couponsApi.createCoupon(payload);
				message.success('Coupon created successfully');
			}
			refetch();
			actions.closeModal();
		} catch (err: any) {
			message.error(err?.message || 'Failed to save coupon');
		} finally {
			actions.setLoading(false);
		}
	};

	const columns: TableColumnType<Coupon>[] = [
		{
			title: 'Index',
			key: 'index',
			align: 'center',
			width: 60,
			render: (_: any, __: any, index: number) => (page - 1) * pageSize + index + 1,
		},
		{
			title: 'Code',
			dataIndex: 'code',
			key: 'code',
			width: 160,
			render: (code: string) => (
				<Tag color='blue' style={{ fontFamily: 'monospace', fontSize: 13 }}>
					{code}
				</Tag>
			),
		},
		{
			title: 'Type',
			dataIndex: 'type',
			key: 'type',
			width: 100,
			align: 'center',
			render: (type: string) => (
				<Tag color={type === 'percentage' ? 'purple' : 'cyan'}>{type?.toUpperCase()}</Tag>
			),
		},
		{
			title: 'Value',
			key: 'value',
			width: 100,
			align: 'right',
			render: (_: any, record: Coupon) =>
				record.type === 'percentage' ? `${record.value}%` : `$${record.value?.toLocaleString()}`,
		},
		{
			title: 'Uses',
			key: 'uses',
			width: 100,
			align: 'center',
			render: (_: any, record: Coupon) => `${record.usedCount} / ${record.maxUses ?? '∞'}`,
		},
		{
			title: 'Valid From',
			dataIndex: 'validFrom',
			key: 'validFrom',
			width: 120,
			align: 'center',
			render: (date: string) => (date ? new Date(date).toLocaleDateString('vi-VN') : '—'),
		},
		{
			title: 'Valid To',
			dataIndex: 'validTo',
			key: 'validTo',
			width: 120,
			align: 'center',
			render: (date: string) => (date ? new Date(date).toLocaleDateString('vi-VN') : '—'),
		},
		{
			title: 'Status',
			dataIndex: 'isActive',
			key: 'isActive',
			width: 90,
			align: 'center',
			render: (isActive: boolean) => (
				<Tag color={isActive ? 'success' : 'default'}>{isActive ? 'Active' : 'Inactive'}</Tag>
			),
		},
		{
			title: 'Actions',
			key: 'actions',
			align: 'center',
			fixed: 'right',
			width: 90,
			render: (record: Coupon) => (
				<Space onClick={(e) => e.stopPropagation()}>
					<Button type='text' icon={<EditOutlined />} size='small' onClick={() => handleEditClick(record)} />
					<Popconfirm
						title='Delete Coupon'
						description='Are you sure you want to delete this coupon?'
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
				title='Coupons'
				total={pagination?.total}
				actions={
					<div className='actions'>
						<Button onClick={() => refetch()}>Refresh</Button>
						<Button icon={<PlusOutlined />} type='primary' onClick={handleAddClick}>
							Add Coupon
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
				title={state.data?._id ? 'Edit Coupon' : 'Add Coupon'}
				isDirty={state.isDirty}
				onClose={actions.closeModal}
				onSubmit={handleSubmit}
				loading={state.loading}
				okText={state.data?._id ? 'Update' : 'Create'}
			>
				<Form form={form} layout='vertical' onValuesChange={() => actions.setDirty(true)}>
					<Form.Item
						name='code'
						label='Coupon Code'
						rules={[{ required: true, message: 'Please enter coupon code' }]}
					>
						<Input placeholder='e.g. SUMMER2025' style={{ textTransform: 'uppercase' }} />
					</Form.Item>
					<Form.Item name='description' label='Description'>
						<Input.TextArea rows={2} placeholder='Optional description' />
					</Form.Item>
					<Form.Item name='type' label='Discount Type' rules={[{ required: true }]}>
						<Select>
							<Select.Option value='percentage'>Percentage (%)</Select.Option>
							<Select.Option value='fixed'>Fixed Amount ($)</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item
						name='value'
						label='Discount Value'
						rules={[{ required: true, message: 'Please enter value' }]}
					>
						<InputNumber min={0} style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item
						name='validFrom'
						label='Valid From'
						rules={[{ required: true, message: 'Please select start date' }]}
					>
						<DatePicker style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item
						name='validTo'
						label='Valid To'
						rules={[{ required: true, message: 'Please select end date' }]}
					>
						<DatePicker style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='maxUses' label='Max Uses (leave blank for unlimited)'>
						<InputNumber min={1} style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='maxUsesPerUser' label='Max Uses Per User' initialValue={1}>
						<InputNumber min={1} style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='minimumPurchase' label='Minimum Purchase ($)'>
						<InputNumber min={0} style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='isActive' label='Active' valuePropName='checked' initialValue={true}>
						<Switch />
					</Form.Item>
				</Form>
			</FormModal>
		</div>
	);
};

export default Coupons;
