import { Achievement, gamificationApi } from '@/api/gamification';
import DataTable from '@/components/datatable/DataTable';
import PageHeader from '@/components/page-header/PageHeader';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Popconfirm, Select, Space, Switch, Tag, Tooltip, message } from 'antd';
import { TableColumnType } from 'antd';
import { useEffect, useState } from 'react';
import { FormModal, useFormModal } from '@/components/modal';

const rarityColorMap: Record<string, string> = {
	common: 'default',
	uncommon: 'green',
	rare: 'blue',
	epic: 'purple',
	legendary: 'gold',
};

const Achievements = () => {
	const [data, setData] = useState<Achievement[]>([]);
	const [loading, setLoading] = useState(false);
	const [state, actions] = useFormModal();
	const [form] = Form.useForm();
	const [deleting, setDeleting] = useState<string | null>(null);

	const fetchData = async () => {
		setLoading(true);
		try {
			const res: any = await gamificationApi.getAchievements();
			setData(res?.data || res || []);
		} catch {
			message.error('Failed to load achievements');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const handleAdd = () => {
		form.resetFields();
		actions.openModal();
	};

	const handleEdit = (record: Achievement) => {
		form.setFieldsValue({
			icon: record.icon,
			name: record.name,
			description: record.description,
			type: record.type,
			rarity: record.rarity,
			conditionMetric: record.condition?.metric,
			conditionThreshold: record.condition?.threshold,
			xpReward: record.xpReward,
			isActive: record.isActive,
		});
		actions.openModal({ ...record });
		actions.setDirty(false);
	};

	const handleDelete = async (id: string) => {
		setDeleting(id);
		try {
			await gamificationApi.deleteAchievement(id);
			message.success('Achievement deleted');
			fetchData();
		} catch {
			message.error('Failed to delete achievement');
		} finally {
			setDeleting(null);
		}
	};

	const handleSave = async () => {
		try {
			const values = await form.validateFields();
			actions.setLoading(true);
			const payload = {
				...values,
				condition: {
					metric: values.conditionMetric,
					threshold: values.conditionThreshold,
				},
			};
			delete payload.conditionMetric;
			delete payload.conditionThreshold;

			if (state.data?._id) {
				await gamificationApi.updateAchievement(state.data._id, payload);
				message.success('Achievement updated');
			} else {
				await gamificationApi.createAchievement(payload);
				message.success('Achievement created');
			}
			fetchData();
			actions.closeModal();
		} catch (err: any) {
			message.error(err?.message || 'Failed to save achievement');
		} finally {
			actions.setLoading(false);
		}
	};

	const columns: TableColumnType<Achievement>[] = [
		{
			title: '#',
			key: 'index',
			align: 'center',
			width: 55,
			render: (_: any, __: any, index: number) => index + 1,
		},
		{
			title: 'Icon',
			dataIndex: 'icon',
			key: 'icon',
			align: 'center',
			width: 65,
			render: (icon: string) => <span style={{ fontSize: 24 }}>{icon || '🏆'}</span>,
		},
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
			width: 200,
			render: (text: string) => <strong>{text}</strong>,
		},
		{
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
			ellipsis: true,
			render: (text: string) => <span style={{ fontSize: 13, color: '#6b7280' }}>{text}</span>,
		},
		{
			title: 'Type',
			dataIndex: 'type',
			key: 'type',
			align: 'center',
			width: 100,
			render: (type: string) => <Tag color='blue'>{type?.toUpperCase()}</Tag>,
		},
		{
			title: 'Rarity',
			dataIndex: 'rarity',
			key: 'rarity',
			align: 'center',
			width: 110,
			render: (rarity: string) => <Tag color={rarityColorMap[rarity] || 'default'}>{rarity?.toUpperCase()}</Tag>,
		},
		{
			title: 'XP Reward',
			dataIndex: 'xpReward',
			key: 'xpReward',
			align: 'center',
			width: 100,
			render: (xp: number) => <span style={{ color: '#fa8c16', fontWeight: 600 }}>+{xp} XP</span>,
		},
		{
			title: 'Active',
			dataIndex: 'isActive',
			key: 'isActive',
			align: 'center',
			width: 80,
			render: (v: boolean) => (v ? <Tag color='success'>Yes</Tag> : <Tag color='default'>No</Tag>),
		},
		{
			title: 'Actions',
			key: 'actions',
			align: 'center',
			fixed: 'right',
			width: 90,
			render: (_: any, record: Achievement) => (
				<Space onClick={(e) => e.stopPropagation()}>
					<Tooltip title='Edit'>
						<Button type='text' size='small' icon={<EditOutlined />} onClick={() => handleEdit(record)} />
					</Tooltip>
					<Popconfirm
						title='Delete Achievement'
						description='Are you sure?'
						onConfirm={() => handleDelete(record._id)}
						okText='Delete'
						cancelText='Cancel'
						okButtonProps={{ danger: true }}
					>
						<Tooltip title='Delete'>
							<Button
								type='text'
								size='small'
								danger
								icon={<DeleteOutlined />}
								loading={deleting === record._id}
							/>
						</Tooltip>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div>
			<PageHeader
				title='Achievements'
				total={data.length}
				actions={
					<Space>
						<Button onClick={fetchData}>Refresh</Button>
						<Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
							Add Achievement
						</Button>
					</Space>
				}
			/>

			<DataTable
				scroll={{ x: 1000 }}
				columns={columns}
				dataSource={data}
				loading={loading}
				rowKey='_id'
				pagination={false}
				onRow={(record) => ({ onClick: () => handleEdit(record), style: { cursor: 'pointer' } })}
			/>

			<FormModal
				isOpen={state.isOpen}
				title={state.data?._id ? 'Edit Achievement' : 'Create Achievement'}
				isDirty={state.isDirty}
				onClose={actions.closeModal}
				onSubmit={handleSave}
				loading={state.loading}
				okText={state.data?._id ? 'Save Changes' : 'Create Achievement'}
			>
				<Form form={form} layout='vertical' onValuesChange={() => actions.setDirty(true)}>
					<Form.Item name='icon' label='Icon (emoji)' initialValue='🏆'>
						<Input placeholder='🏆' style={{ fontSize: 24, width: 80 }} />
					</Form.Item>
					<Form.Item name='name' label='Name' rules={[{ required: true, message: 'Please enter name' }]}>
						<Input placeholder='e.g. First Course Completed' />
					</Form.Item>
					<Form.Item name='description' label='Description' rules={[{ required: true }]}>
						<Input.TextArea rows={2} placeholder='What do students get this for?' />
					</Form.Item>
					<div style={{ display: 'flex', gap: 12 }}>
						<Form.Item name='type' label='Type' rules={[{ required: true }]} style={{ flex: 1 }}>
							<Select>
								<Select.Option value='course'>Course</Select.Option>
								<Select.Option value='streak'>Streak</Select.Option>
								<Select.Option value='quiz'>Quiz</Select.Option>
								<Select.Option value='social'>Social</Select.Option>
								<Select.Option value='milestone'>Milestone</Select.Option>
							</Select>
						</Form.Item>
						<Form.Item name='rarity' label='Rarity' initialValue='common' style={{ flex: 1 }}>
							<Select>
								<Select.Option value='common'>Common</Select.Option>
								<Select.Option value='uncommon'>Uncommon</Select.Option>
								<Select.Option value='rare'>Rare</Select.Option>
								<Select.Option value='epic'>Epic</Select.Option>
								<Select.Option value='legendary'>Legendary</Select.Option>
							</Select>
						</Form.Item>
					</div>
					<div style={{ display: 'flex', gap: 12 }}>
						<Form.Item
							name='conditionMetric'
							label='Condition Metric'
							rules={[{ required: true }]}
							style={{ flex: 1 }}
						>
							<Input placeholder='e.g. coursesCompleted' />
						</Form.Item>
						<Form.Item
							name='conditionThreshold'
							label='Threshold'
							rules={[{ required: true }]}
							style={{ flex: 1 }}
						>
							<InputNumber min={1} style={{ width: '100%' }} placeholder='e.g. 1' />
						</Form.Item>
					</div>
					<Form.Item name='xpReward' label='XP Reward' initialValue={50}>
						<InputNumber min={0} style={{ width: '100%' }} addonAfter='XP' />
					</Form.Item>
					<Form.Item name='isActive' label='Active' valuePropName='checked' initialValue={true}>
						<Switch />
					</Form.Item>
				</Form>
			</FormModal>
		</div>
	);
};

export default Achievements;
