import { Quiz, quizzesApi } from '@/api/quizzes';
import DataTable from '@/components/datatable/DataTable';
import PageHeader from '@/components/page-header/PageHeader';
import { usePaginatedFetch } from '@/hooks/useFetch';
import {
	CheckCircleOutlined,
	DeleteOutlined,
	EditOutlined,
	OrderedListOutlined,
	PlusOutlined,
	QuestionCircleOutlined,
} from '@ant-design/icons';
import {
	Button,
	Card,
	Drawer,
	Form,
	Input,
	InputNumber,
	Modal,
	Popconfirm,
	Radio,
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

// ─── Question Editor Drawer ───────────────────────────────────────────────────
const QuestionEditorDrawer = ({
	open,
	quiz,
	onClose,
}: {
	open: boolean;
	quiz: Quiz | null;
	onClose: () => void;
}) => {
	const [questions, setQuestions] = useState<any[]>([]);
	const [_saving, setSaving] = useState(false);
	const [loadingQuiz, setLoadingQuiz] = useState(false);
	const [qModal, setQModal] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
	const [qForm] = Form.useForm();

	useEffect(() => {
		if (open && quiz) {
			setLoadingQuiz(true);
			quizzesApi.getQuizById(quiz._id)
				.then((res: any) => {
					const full = res?.data || res;
					setQuestions(full?.questions || []);
				})
				.catch(() => setQuestions([]))
				.finally(() => setLoadingQuiz(false));
		}
	}, [open, quiz]);

	const saveQuestions = async (updated: any[]) => {
		if (!quiz) return;
		setSaving(true);
		try {
			await quizzesApi.updateQuiz(quiz._id, { questions: updated } as any);
			message.success('Questions saved');
		} catch {
			message.error('Failed to save questions');
		} finally {
			setSaving(false);
		}
	};

	const openAddQuestion = () => {
		qForm.resetFields();
		qForm.setFieldsValue({
			options: [
				{ text: '', isCorrect: true },
				{ text: '', isCorrect: false },
				{ text: '', isCorrect: false },
				{ text: '', isCorrect: false },
			],
			correctAnswer: 0,
		});
		setQModal({ open: true, idx: null });
	};

	const openEditQuestion = (idx: number) => {
		const q = questions[idx];
		qForm.setFieldsValue({
			questionText: q.questionText,
			type: q.type || 'multiple_choice',
			explanation: q.explanation,
			points: q.points ?? 1,
			options: q.options || [{ text: '', isCorrect: true }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }],
			correctAnswer: q.options?.findIndex((o: any) => o.isCorrect) ?? 0,
		});
		setQModal({ open: true, idx });
	};

	const handleSaveQuestion = async () => {
		const vals = await qForm.validateFields();
		const options = (vals.options || []).map((opt: any, i: number) => ({
			text: opt.text,
			isCorrect: i === vals.correctAnswer,
		}));
		const question = {
			questionText: vals.questionText,
			type: vals.type || 'multiple_choice',
			options,
			explanation: vals.explanation || '',
			points: vals.points ?? 1,
		};
		const updated = [...questions];
		if (qModal.idx === null) {
			updated.push(question);
		} else {
			updated[qModal.idx] = question;
		}
		setQuestions(updated);
		await saveQuestions(updated);
		setQModal({ open: false, idx: null });
	};

	const deleteQuestion = async (idx: number) => {
		const updated = questions.filter((_, i) => i !== idx);
		setQuestions(updated);
		await saveQuestions(updated);
	};

	return (
		<>
			<Drawer
				title={
					<Space>
						<OrderedListOutlined style={{ color: '#722ed1' }} />
						<span>Question Editor — <strong>{quiz?.title}</strong></span>
					</Space>
				}
				open={open}
				onClose={onClose}
				width={700}
				loading={loadingQuiz}
				footer={
					<div style={{ textAlign: 'right' }}>
						<Button onClick={onClose}>Close</Button>
					</div>
				}
			>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
					<Space>
						<Text type='secondary'>{questions.length} questions</Text>
						{quiz?.passingScore && (
							<Tag color='blue'>Pass: {quiz.passingScore}%</Tag>
						)}
						{quiz?.duration && (
							<Tag color='orange'>{quiz.duration} min</Tag>
						)}
					</Space>
					<Button type='primary' icon={<PlusOutlined />} onClick={openAddQuestion}>
						Add Question
					</Button>
				</div>

				{questions.length === 0 ? (
					<div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
						<QuestionCircleOutlined style={{ fontSize: 40, marginBottom: 12 }} />
						<div>No questions yet. Add your first question.</div>
					</div>
				) : (
					<Space direction='vertical' style={{ width: '100%' }} size={8}>
						{questions.map((q, idx) => (
							<Card
								key={idx}
								size='small'
								style={{ borderRadius: 10, border: '1px solid #f0f0f0' }}
								styles={{ body: { padding: '12px 16px' } }}
							>
								<div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
									<div style={{ flex: 1 }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
											<div style={{ width: 24, height: 24, borderRadius: 6, background: '#f0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#722ed1', flexShrink: 0 }}>
												{idx + 1}
											</div>
											<Text strong style={{ fontSize: 13 }}>{q.questionText}</Text>
											{q.points > 1 && <Tag color='gold'>{q.points}pts</Tag>}
										</div>
										<div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4, paddingLeft: 32 }}>
											{(q.options || []).map((opt: any, oi: number) => (
												<Tag
													key={oi}
													icon={opt.isCorrect ? <CheckCircleOutlined /> : undefined}
													color={opt.isCorrect ? 'success' : 'default'}
													style={{ fontSize: 12 }}
												>
													{String.fromCharCode(65 + oi)}. {opt.text}
												</Tag>
											))}
										</div>
										{q.explanation && (
											<Text type='secondary' style={{ fontSize: 11, marginTop: 4, display: 'block', paddingLeft: 32 }}>
												💡 {q.explanation}
											</Text>
										)}
									</div>
									<Space>
										<Button type='text' size='small' icon={<EditOutlined />} onClick={() => openEditQuestion(idx)} />
										<Popconfirm title='Delete this question?' onConfirm={() => deleteQuestion(idx)} okButtonProps={{ danger: true }}>
											<Button type='text' size='small' danger icon={<DeleteOutlined />} />
										</Popconfirm>
									</Space>
								</div>
							</Card>
						))}
					</Space>
				)}
			</Drawer>

			{/* Question Modal */}
			<Modal
				open={qModal.open}
				title={
					<Space>
						<QuestionCircleOutlined style={{ color: '#722ed1' }} />
						{qModal.idx === null ? 'Add Question' : 'Edit Question'}
					</Space>
				}
				onOk={handleSaveQuestion}
				onCancel={() => setQModal({ open: false, idx: null })}
				okText='Save Question'
				width={600}
				style={{ top: 20 }}
			>
				<Form form={qForm} layout='vertical'>
					<Form.Item
						name='questionText'
						label='Question'
						rules={[{ required: true, message: 'Please enter the question' }]}
					>
						<Input.TextArea rows={2} placeholder='e.g. What is the output of console.log(typeof null)?' />
					</Form.Item>

					<div style={{ display: 'flex', gap: 12 }}>
						<Form.Item name='type' label='Type' initialValue='multiple_choice' style={{ flex: 1 }}>
							<Select>
								<Select.Option value='multiple_choice'>Multiple Choice</Select.Option>
								<Select.Option value='true_false'>True / False</Select.Option>
							</Select>
						</Form.Item>
						<Form.Item name='points' label='Points' initialValue={1} style={{ width: 100 }}>
							<InputNumber min={1} max={10} style={{ width: '100%' }} />
						</Form.Item>
					</div>

					<Form.Item
						name='correctAnswer'
						label='Correct Answer'
						rules={[{ required: true, message: 'Select the correct option' }]}
					>
						<Radio.Group style={{ width: '100%' }}>
							<Form.List name='options'>
								{(fields) => (
									<Space direction='vertical' style={{ width: '100%' }}>
										{fields.map(({ key, name }) => (
											<div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
												<Radio value={name} style={{ flexShrink: 0 }}>
													<Text style={{ fontWeight: 600, color: '#722ed1' }}>
														{String.fromCharCode(65 + name)}
													</Text>
												</Radio>
												<Form.Item
													name={[name, 'text']}
													style={{ flex: 1, marginBottom: 0 }}
													rules={[{ required: true, message: 'Option text required' }]}
												>
													<Input placeholder={`Option ${String.fromCharCode(65 + name)}`} />
												</Form.Item>
											</div>
										))}
									</Space>
								)}
							</Form.List>
						</Radio.Group>
					</Form.Item>

					<Form.Item name='explanation' label='Explanation (optional)'>
						<Input.TextArea rows={2} placeholder='Explain why the correct answer is right...' />
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const InstructorQuizzes = () => {
	const { data, pagination, loading, refetch, page, pageSize, setPage, setPageSize } = usePaginatedFetch<Quiz>(
		'instructor-quizzes',
		(params) => quizzesApi.getQuizzes(params),
	);

	const [state, actions] = useFormModal();
	const [form] = Form.useForm();
	const [courses, setCourses] = useState<any[]>([]);
	const [qEditorOpen, setQEditorOpen] = useState(false);
	const [qEditorQuiz, setQEditorQuiz] = useState<Quiz | null>(null);

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

	const handleAdd = () => { form.resetFields(); actions.openModal(); };

	const handleEdit = (record: Quiz) => {
		form.setFieldsValue({
			title: record.title,
			courseId: typeof record.courseId === 'object' ? (record.courseId as any)._id : record.courseId,
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
					<QuestionCircleOutlined style={{ color: '#722ed1' }} />
					<Text strong style={{ fontSize: 13 }}>{text}</Text>
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
				return course ? <Text style={{ fontSize: 13 }}>{course.title}</Text> : <Text type='secondary'>—</Text>;
			},
		},
		{
			title: 'Questions',
			dataIndex: 'questions',
			key: 'questions',
			align: 'center',
			width: 100,
			render: (questions: any[]) => <Tag color='purple'>{questions?.length ?? 0}</Tag>,
		},
		{
			title: 'Duration',
			dataIndex: 'duration',
			key: 'duration',
			align: 'center',
			width: 100,
			render: (v: number) => (v ? <Tag>{v} min</Tag> : '—'),
		},
		{
			title: 'Pass Score',
			dataIndex: 'passingScore',
			key: 'passingScore',
			align: 'center',
			width: 100,
			render: (v: number) => (v != null ? <Tag color='blue'>{v}%</Tag> : '—'),
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
			render: (v: boolean) => v ? <Tag color='success'>Yes</Tag> : <Tag color='default'>No</Tag>,
		},
		{
			title: 'Actions',
			key: 'actions',
			align: 'center',
			fixed: 'right',
			width: 130,
			render: (_: any, record: Quiz) => (
				<Space onClick={(e) => e.stopPropagation()}>
					<Tooltip title='Edit Quiz Settings'>
						<Button type='text' size='small' icon={<EditOutlined />} onClick={() => handleEdit(record)} />
					</Tooltip>
					<Tooltip title='Manage Questions'>
						<Button
							type='text'
							size='small'
							icon={<OrderedListOutlined style={{ color: '#722ed1' }} />}
							onClick={() => { setQEditorQuiz(record); setQEditorOpen(true); }}
						/>
					</Tooltip>
					<Popconfirm
						title='Delete Quiz?'
						description='All attempts will be lost.'
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
					<Space>
						<Button onClick={() => refetch()}>Refresh</Button>
						<Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
							New Quiz
						</Button>
					</Space>
				}
			/>

			<DataTable
				scroll={{ x: 1100 }}
				columns={columns}
				dataSource={data || []}
				loading={loading}
				rowKey='_id'
				tableLayout='fixed'
				pagination={{ current: page, pageSize, total: pagination?.total || 0 }}
				onChange={(p) => { setPage(p.current || 1); setPageSize(p.pageSize || 10); }}
				onRow={(record) => ({ onClick: () => handleEdit(record), style: { cursor: 'pointer' } })}
			/>

			{/* Quiz Settings Modal */}
			<FormModal
				isOpen={state.isOpen}
				title={state.data?._id ? 'Edit Quiz Settings' : 'Create New Quiz'}
				isDirty={state.isDirty}
				onClose={actions.closeModal}
				onSubmit={handleSave}
				loading={state.loading}
				okText={state.data?._id ? 'Save Changes' : 'Create Quiz'}
			>
				<Form form={form} layout='vertical' onValuesChange={() => actions.setDirty(true)}>
					<Form.Item name='title' label='Quiz Title' rules={[{ required: true }]}>
						<Input placeholder='e.g. JavaScript Basics Quiz' />
					</Form.Item>
					<Form.Item name='courseId' label='Course' rules={[{ required: true }]}>
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
						<Form.Item name='duration' label='Duration (min)' style={{ flex: 1 }}>
							<InputNumber min={1} style={{ width: '100%' }} placeholder='30' addonAfter='min' />
						</Form.Item>
						<Form.Item name='passingScore' label='Pass Score (%)' style={{ flex: 1 }} initialValue={70}>
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

			{/* Question Editor Drawer */}
			<QuestionEditorDrawer
				open={qEditorOpen}
				quiz={qEditorQuiz}
				onClose={() => { setQEditorOpen(false); setQEditorQuiz(null); }}
			/>
		</div>
	);
};

export default InstructorQuizzes;
