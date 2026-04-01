import { quizzesApi, Quiz } from '@/api/quizzes';
import DataTable from '@/components/datatable/DataTable';
import PageHeader from '@/components/page-header/PageHeader';
import { usePaginatedFetch } from '@/hooks/useFetch';
import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	DeleteOutlined,
	OrderedListOutlined,
	QuestionCircleOutlined,
	SearchOutlined,
	SyncOutlined,
} from '@ant-design/icons';
import {
	Avatar,
	Button,
	Drawer,
	Input,
	Popconfirm,
	Space,
	Tag,
	Tooltip,
	Typography,
	message,
} from 'antd';
import { TableColumnType } from 'antd';
import { useState } from 'react';

const { Text } = Typography;

const difficultyColorMap: Record<string, string> = {
	easy: 'success',
	medium: 'warning',
	hard: 'error',
};

const Quizzes = () => {
	const [search, setSearch] = useState('');
	const [searchInput, setSearchInput] = useState('');
	const [detailOpen, setDetailOpen] = useState(false);
	const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
	const [loadingDetail, setLoadingDetail] = useState(false);

	const { data, pagination, loading, refetch, page, pageSize, setPage, setPageSize } =
		usePaginatedFetch<Quiz>(
			`admin-quizzes-${search}`,
			(params) => quizzesApi.getQuizzes({ ...params, search: search || undefined } as any),
		);

	const handleSearch = () => {
		setSearch(searchInput);
		setPage(1);
	};

	const handleViewDetail = async (quiz: Quiz) => {
		setSelectedQuiz(quiz);
		setDetailOpen(true);
		setLoadingDetail(true);
		try {
			const res: any = await quizzesApi.getQuizById(quiz._id);
			const full = res?.data?.data || res?.data || res;
			setSelectedQuiz(full?.quiz || full);
		} catch {
			// use preview data
		} finally {
			setLoadingDetail(false);
		}
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

	const columns: TableColumnType<Quiz>[] = [
		{
			title: '#',
			key: 'index',
			align: 'center',
			width: 55,
			render: (_: any, __: any, i: number) => (page - 1) * pageSize + i + 1,
		},
		{
			title: 'Title',
			dataIndex: 'title',
			key: 'title',
			fixed: 'left',
			width: 260,
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
			width: 220,
			render: (courseId: any) => {
				if (typeof courseId === 'object' && courseId?.title) {
					return (
						<Space>
							{courseId.thumbnail && (
								<img
									src={courseId.thumbnail}
									style={{ width: 32, height: 22, objectFit: 'cover', borderRadius: 3 }}
									alt=''
								/>
							)}
							<Text style={{ fontSize: 13 }}>{courseId.title}</Text>
						</Space>
					);
				}
				return <Text type='secondary'>—</Text>;
			},
		},
		{
			title: 'Instructor',
			key: 'instructor',
			width: 160,
			render: (_: any, record: Quiz) => {
				const instructor = (record.courseId as any)?.instructor;
				if (!instructor) return <Text type='secondary'>—</Text>;
				return (
					<Space>
						<Avatar size={24} src={instructor.avatar} style={{ background: '#1890ff', fontSize: 11 }}>
							{instructor.name?.[0]}
						</Avatar>
						<Text style={{ fontSize: 13 }}>{instructor.name}</Text>
					</Space>
				);
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
			width: 90,
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
			render: (d: string) =>
				d ? <Tag color={difficultyColorMap[d] || 'default'}>{d.toUpperCase()}</Tag> : '—',
		},
		{
			title: 'Published',
			dataIndex: 'isPublished',
			key: 'isPublished',
			align: 'center',
			width: 90,
			render: (v: boolean) =>
				v ? (
					<Tag icon={<CheckCircleOutlined />} color='success'>Yes</Tag>
				) : (
					<Tag icon={<CloseCircleOutlined />} color='default'>No</Tag>
				),
		},
		{
			title: 'Created',
			dataIndex: 'createdAt',
			key: 'createdAt',
			align: 'center',
			width: 110,
			render: (d: string) => new Date(d).toLocaleDateString('vi-VN'),
		},
		{
			title: 'Actions',
			key: 'actions',
			align: 'center',
			fixed: 'right',
			width: 90,
			render: (_: any, record: Quiz) => (
				<Space onClick={(e) => e.stopPropagation()}>
					<Tooltip title='View Questions'>
						<Button
							type='text'
							size='small'
							icon={<OrderedListOutlined style={{ color: '#722ed1' }} />}
							onClick={() => handleViewDetail(record)}
						/>
					</Tooltip>
					<Popconfirm
						title='Delete Quiz?'
						description='All student attempts will also be removed.'
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
				title='Quizzes'
				total={pagination?.total}
				actions={
					<Space wrap>
						<Input
							placeholder='Search quiz title...'
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							onPressEnter={handleSearch}
							style={{ width: 220 }}
							suffix={
								<SearchOutlined
									style={{ color: '#aaa', cursor: 'pointer' }}
									onClick={handleSearch}
								/>
							}
						/>
						<Button icon={<SyncOutlined />} onClick={() => refetch()}>
							Refresh
						</Button>
					</Space>
				}
			/>

			<DataTable
				scroll={{ x: 1400 }}
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
					onClick: () => handleViewDetail(record),
					style: { cursor: 'pointer' },
				})}
			/>

			{/* Quiz Detail Drawer */}
			<Drawer
				title={
					<Space>
						<QuestionCircleOutlined style={{ color: '#722ed1' }} />
						<span>
							Quiz: <strong>{selectedQuiz?.title}</strong>
						</span>
					</Space>
				}
				open={detailOpen}
				onClose={() => { setDetailOpen(false); setSelectedQuiz(null); }}
				width={600}
				loading={loadingDetail}
			>
				{selectedQuiz && (
					<>
						<div style={{ marginBottom: 20 }}>
							<Space wrap>
								{selectedQuiz.duration && <Tag icon={<OrderedListOutlined />}>{selectedQuiz.duration} min</Tag>}
								{selectedQuiz.passingScore != null && (
									<Tag color='blue'>Pass: {selectedQuiz.passingScore}%</Tag>
								)}
								{selectedQuiz.difficulty && (
									<Tag color={difficultyColorMap[selectedQuiz.difficulty] || 'default'}>
										{selectedQuiz.difficulty.toUpperCase()}
									</Tag>
								)}
								{selectedQuiz.isPublished ? (
									<Tag color='success'>Published</Tag>
								) : (
									<Tag color='default'>Draft</Tag>
								)}
							</Space>
						</div>

						<Text type='secondary' style={{ fontSize: 13 }}>
							{selectedQuiz.questions?.length ?? 0} questions
						</Text>

						<div style={{ marginTop: 16 }}>
							{(selectedQuiz.questions || []).map((q: any, idx: number) => (
								<div
									key={idx}
									style={{
										padding: '14px 16px',
										background: '#fafafa',
										borderRadius: 10,
										marginBottom: 10,
										border: '1px solid #f0f0f0',
									}}
								>
									<div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
										<div
											style={{
												width: 26,
												height: 26,
												borderRadius: 6,
												background: '#f0f0ff',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												fontSize: 12,
												fontWeight: 700,
												color: '#722ed1',
												flexShrink: 0,
											}}
										>
											{idx + 1}
										</div>
										<Text strong style={{ fontSize: 13 }}>
											{q.questionText}
										</Text>
										{q.points > 1 && <Tag color='gold'>{q.points}pts</Tag>}
									</div>
									<div style={{ paddingLeft: 36 }}>
										{(q.options || []).map((opt: any, oi: number) => (
											<Tag
												key={oi}
												icon={opt.isCorrect ? <CheckCircleOutlined /> : undefined}
												color={opt.isCorrect ? 'success' : 'default'}
												style={{ margin: '2px 4px 2px 0', fontSize: 12 }}
											>
												{String.fromCharCode(65 + oi)}. {opt.text}
											</Tag>
										))}
									</div>
									{q.explanation && (
										<Text
											type='secondary'
											style={{ fontSize: 11, marginTop: 6, display: 'block', paddingLeft: 36 }}
										>
											💡 {q.explanation}
										</Text>
									)}
								</div>
							))}
						</div>
					</>
				)}
			</Drawer>
		</div>
	);
};

export default Quizzes;
