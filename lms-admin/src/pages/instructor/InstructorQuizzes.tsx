import { Quiz, quizzesApi } from '@/api/quizzes';
import DataTable from '@/components/datatable/DataTable';
import PageHeader from '@/components/page-header/PageHeader';
import { usePaginatedFetch } from '@/hooks/useFetch';
import { DeleteOutlined, EditOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
	Button,
	Form,
	Input,
	InputNumber,
	Popconfirm,
	Select,
	Space,
	Switch,
	Tag,
	Tooltip,
	Typography,
	message,
} from 'antd';
import { TableColumnType } from 'antd';
import { FormModal, useFormModal } from '@/components/modal';
import { useState, useEffect } from 'react';

const { Text } = Typography;

const difficultyColorMap: Record<string, string> = {
	easy: 'success',
	medium: 'warning',
	hard: 'error',
};

const InstructorQuizzes = () => {
	const { data, pagination, loading, refetch, page, pageSize, setPage, setPageSize } = usePaginatedFetch<Quiz>(
		'instructor-quizzes',
		(params) => quizzesApi.getQuizzes(params),
	);

	const [state, actions] = useFormModal();
	const [form] = Form.useForm();
	const [courses, setCourses] = useState<any[]>([]);

	// Fetch instructor's courses for the dropdown
	useEffect(() => {
		import('@/api/instructorCourses').then(({ instructorCoursesApi }) => {
			instructorCoursesApi
				.getMyCourses({ limit: 100 })
				.then((res: any) => {
					const list = res?.data?.courses || res?.data || res || [];
					setCourses(Array.isArray(list) ? list : []);
				})
				.catch(() => setCourses([]));
		});
	}, []);

	const handleAdd = () => {
		form.resetFields();
		actions.openModal();
	};

	const handleEdit = (record: Quiz) => {
		form.setFieldsValue({
			title: record.title,
			courseId: record.courseId,
			description: record.description,
			duration: record.duration,
			passingScore: record.passingScore,
			maxAttempts: record.maxAttempts,
			difficulty: record.difficulty,
			isPublished: record.isPublished,
		});
		actions.openModal({ ...record });
		actions.setDirty(false);
	};

	const handleDelete = async (id: string) => {
		try {
			await quizzesApi.deleteQuiz(id);
			message.success('Quiz deleted');
			refetch();
		} catch (err: any) {
			message.error(err?.message || 'Failed to delete quiz');
		}
	};

	const handleSave = async () => {
		try {
			const values = await form.validateFields();
			actions.setLoading(true);
			if (state.data?._id) {
				await quizzesApi.updateQuiz(state.data._id, values);
				message.success('Quiz updated');
			} else {
				await quizzesApi.createQuiz(values);
				message.success('Quiz created');
			}
			refetch();
			actions.closeModal();
		} catch (err: any) {
			message.error(err?.message || 'Failed to save quiz');
		} finally {
			actions.setLoading(false);
		}
	};

	const columns: TableColumnType<Quiz>[] = [
		{
			title: '#',
			key: 'index',
			align: 'center',
			width: 50,
			render: (_: any, __: any, index: number) => (page - 1) * pageSize + index + 1,
		},
		{
			title: 'Title',
			dataIndex: 'title',
			key: 'title',
			fixed: 'left',
			render: (text: string) => (
				<Space>
					<QuestionCircleOutlined style={{ color: '#1890ff' }} />
					<strong>{text}</strong>
				</Space>
			),
		},
		{
			title: 'Course',
			dataIndex: 'courseId',
			key: 'course',
			render: (courseId: any) => {
				if (typeof courseId === 'object' && courseId?.title) return courseId.title;
				const course = courses.find((c) => c._id === courseId);
				return course ? course.title : <Text type='secondary'>—</Text>;
			},
		},
		{
			title: 'Questions',
			dataIndex: 'questions',
			key: 'questions',
			align: 'center',
			width: 100,
			render: (questions: any[]) => questions?.length ?? 0,
		},
		{
			title: 'Duration',
			dataIndex: 'duration',
			key: 'duration',
			align: 'center',
			width: 100,
			render: (v: number) => (v ? `${v} min` : '—'),
		},
		{
			title: 'Pass Score',
			dataIndex: 'passingScore',
			key: 'passingScore',
			align: 'center',
			width: 100,
			render: (v: number) => (v != null ? `${v}%` : '—'),
		},
		{
			title: 'Difficulty',
			dataIndex: 'difficulty',
			key: 'difficulty',
			align: 'center',
			width: 100,
			render: (d: string) => (d ? <Tag color={difficultyColorMap[d] || 'default'}>{d.toUpperCase()}</Tag> : '—'),
		},
		{
			title: 'Published',
			dataIndex: 'isPublished',
			key: 'isPublished',
			align: 'center',
			width: 90,
			render: (v: boolean) => (v ? <Tag color='success'>Yes</Tag> : <Tag color='default'>No</Tag>),
		},
		{
			title: 'Actions',
			key: 'actions',
			align: 'center',
			fixed: 'right',
			width: 100,
			render: (record: Quiz) => (
				<Space onClick={(e) => e.stopPropagation()}>
					<Tooltip title='Edit'>
						<Button type='text' size='small' icon={<EditOutlined />} onClick={() => handleEdit(record)} />
					</Tooltip>
					<Popconfirm
						title='Delete Quiz'
						description='All attempts for this quiz will be lost.'
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
				title='My Quizzes'
				total={pagination?.total}
				actions={
					<div className='actions'>
						<Button onClick={() => refetch()}>Refresh</Button>
						<Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
							New Quiz
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
				onRow={(record) => ({
					onClick: () => handleEdit(record),
					style: { cursor: 'pointer' },
				})}
			/>

			<FormModal
				isOpen={state.isOpen}
				title={state.data?._id ? 'Edit Quiz' : 'Create New Quiz'}
				isDirty={state.isDirty}
				onClose={actions.closeModal}
				onSubmit={handleSave}
				loading={state.loading}
				okText={state.data?._id ? 'Save Changes' : 'Create Quiz'}
			>
				<Form form={form} layout='vertical' onValuesChange={() => actions.setDirty(true)}>
					<Form.Item
						name='title'
						label='Quiz Title'
						rules={[{ required: true, message: 'Please enter quiz title' }]}
					>
						<Input placeholder='e.g. JavaScript Basics Quiz' />
					</Form.Item>

					<Form.Item
						name='courseId'
						label='Course'
						rules={[{ required: true, message: 'Please select a course' }]}
					>
						<Select
							placeholder='Select course'
							showSearch
							optionFilterProp='label'
							options={courses.map((c) => ({ value: c._id, label: c.title }))}
						/>
					</Form.Item>

					<Form.Item name='description' label='Description'>
						<Input.TextArea rows={2} placeholder='What is this quiz about?' />
					</Form.Item>

					<div style={{ display: 'flex', gap: 12 }}>
						<Form.Item name='duration' label='Duration (minutes)' style={{ flex: 1 }}>
							<InputNumber min={1} style={{ width: '100%' }} placeholder='30' addonAfter='min' />
						</Form.Item>
						<Form.Item name='passingScore' label='Passing Score (%)' style={{ flex: 1 }} initialValue={70}>
							<InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter='%' />
						</Form.Item>
					</div>

					<div style={{ display: 'flex', gap: 12 }}>
						<Form.Item name='maxAttempts' label='Max Attempts' style={{ flex: 1 }} initialValue={3}>
							<InputNumber min={1} style={{ width: '100%' }} placeholder='3' />
						</Form.Item>
						<Form.Item name='difficulty' label='Difficulty' style={{ flex: 1 }} initialValue='medium'>
							<Select>
								<Select.Option value='easy'>Easy</Select.Option>
								<Select.Option value='medium'>Medium</Select.Option>
								<Select.Option value='hard'>Hard</Select.Option>
							</Select>
						</Form.Item>
					</div>

					<Form.Item name='isPublished' label='Published' valuePropName='checked' initialValue={false}>
						<Switch />
					</Form.Item>
				</Form>
			</FormModal>
		</div>
	);
};

export default InstructorQuizzes;
