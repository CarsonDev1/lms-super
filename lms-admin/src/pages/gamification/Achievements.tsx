import { Achievement, gamificationApi } from '@/api/gamification';
import DataTable from '@/components/datatable/DataTable';
import PageHeader from '@/components/page-header/PageHeader';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Select, Switch, Tag, message } from 'antd';
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
			await gamificationApi.createAchievement(payload);
			message.success('Achievement created');
			fetchData();
			actions.closeModal();
		} catch (err: any) {
			message.error(err?.message || 'Failed to create achievement');
		} finally {
			actions.setLoading(false);
		}
	};

	const columns: TableColumnType<Achievement>[] = [
		{
			title: 'Index',
			key: 'index',
			align: 'center',
			width: 60,
			render: (_: any, __: any, index: number) => index + 1,
		},
		{
			title: 'Icon',
			dataIndex: 'icon',
			key: 'icon',
			align: 'center',
			width: 70,
			render: (icon: string) => <span style={{ fontSize: 24 }}>{icon || '🏆'}</span>,
		},
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
			render: (text: string) => <strong>{text}</strong>,
		},
		{
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
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
			width: 100,
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
	];

	return (
		<div>
			<PageHeader
				title='Achievements'
				total={data.length}
				actions={
					<div className='actions'>
						<Button onClick={fetchData}>Refresh</Button>
						<Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
							Add Achievement
						</Button>
					</div>
				}
			/>

			<DataTable
				scroll={{ x: 900 }}
				columns={columns}
				dataSource={data}
				loading={loading}
				rowKey='_id'
				pagination={false}
			/>

			<FormModal
				isOpen={state.isOpen}
				title='Create Achievement'
				isDirty={state.isDirty}
				onClose={actions.closeModal}
				onSubmit={handleSave}
				loading={state.loading}
				okText='Create Achievement'
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
