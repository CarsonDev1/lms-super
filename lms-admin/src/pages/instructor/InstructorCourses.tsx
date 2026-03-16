import { InstructorCourse, instructorCoursesApi } from '@/api/instructorCourses';
import { Category, categoriesApi } from '@/api/categories';
import { Level, levelsApi } from '@/api/levels';
import DataTable from '@/components/datatable/DataTable';
import PageHeader from '@/components/page-header/PageHeader';
import { usePaginatedFetch } from '@/hooks/useFetch';
import {
	AppstoreOutlined,
	BookOutlined,
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SendOutlined,
	UploadOutlined,
} from '@ant-design/icons';
import {
	Button,
	Collapse,
	Drawer,
	Form,
	Input,
	InputNumber,
	Modal,
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
import { useEffect, useState } from 'react';
import { FormModal, useFormModal } from '@/components/modal';

const { Text } = Typography;
const { Panel } = Collapse;

const statusColorMap: Record<string, string> = {
	draft: 'default',
	pending: 'warning',
	approved: 'success',
	published: 'success',
	archived: 'default',
	rejected: 'error',
};

// ─── Curriculum Builder Drawer ────────────────────────────────────────────────
const CurriculumDrawer = ({
	open,
	course,
	onClose,
}: {
	open: boolean;
	course: InstructorCourse | null;
	onClose: () => void;
}) => {
	const [curriculum, setCurriculum] = useState<any[]>([]);
	const [_saving, setSaving] = useState(false);
	const [sectionModal, setSectionModal] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
	const [lessonModal, setLessonModal] = useState<{ open: boolean; sectionIdx: number; lessonIdx: number | null }>({
		open: false,
		sectionIdx: 0,
		lessonIdx: null,
	});
	const [sectionForm] = Form.useForm();
	const [lessonForm] = Form.useForm();

	useEffect(() => {
		if (open && course) {
			const fetchCourse = async () => {
				try {
					const res: any = await instructorCoursesApi.getCourseById(course._id);
					const full = res?.data || res;
					setCurriculum(full?.curriculum || []);
				} catch {
					setCurriculum([]);
				}
			};
			fetchCourse();
		}
	}, [open, course]);

	const saveCurriculum = async (updated: any[]) => {
		if (!course) return;
		setSaving(true);
		try {
			await instructorCoursesApi.updateCourse(course._id, { curriculum: updated } as any);
			message.success('Curriculum saved');
		} catch {
			message.error('Failed to save curriculum');
		} finally {
			setSaving(false);
		}
	};

	// ── Section helpers ──────────────────────────────────────────
	const openAddSection = () => { sectionForm.resetFields(); setSectionModal({ open: true, idx: null }); };
	const openEditSection = (idx: number) => {
		sectionForm.setFieldsValue({ title: curriculum[idx].title });
		setSectionModal({ open: true, idx });
	};
	const handleSaveSection = async () => {
		const vals = await sectionForm.validateFields();
		const updated = [...curriculum];
		if (sectionModal.idx === null) {
			updated.push({ title: vals.title, order: updated.length + 1, lessons: [] });
		} else {
			updated[sectionModal.idx] = { ...updated[sectionModal.idx], title: vals.title };
		}
		setCurriculum(updated);
		await saveCurriculum(updated);
		setSectionModal({ open: false, idx: null });
	};
	const deleteSection = async (idx: number) => {
		const updated = curriculum.filter((_, i) => i !== idx);
		setCurriculum(updated);
		await saveCurriculum(updated);
	};

	// ── Lesson helpers ────────────────────────────────────────────
	const openAddLesson = (sectionIdx: number) => {
		lessonForm.resetFields();
		setLessonModal({ open: true, sectionIdx, lessonIdx: null });
	};
	const openEditLesson = (sectionIdx: number, lessonIdx: number) => {
		const lesson = curriculum[sectionIdx].lessons[lessonIdx];
		lessonForm.setFieldsValue({
			title: lesson.title,
			videoUrl: lesson.videoUrl,
			duration: lesson.duration,
			isFree: lesson.isFree ?? false,
		});
		setLessonModal({ open: true, sectionIdx, lessonIdx });
	};
	const handleSaveLesson = async () => {
		const vals = await lessonForm.validateFields();
		const updated = [...curriculum];
		const sec = { ...updated[lessonModal.sectionIdx], lessons: [...(updated[lessonModal.sectionIdx].lessons || [])] };
		if (lessonModal.lessonIdx === null) {
			sec.lessons.push({ title: vals.title, videoUrl: vals.videoUrl || '', duration: vals.duration || 0, order: sec.lessons.length + 1, isFree: vals.isFree });
		} else {
			sec.lessons[lessonModal.lessonIdx] = { ...sec.lessons[lessonModal.lessonIdx], ...vals };
		}
		updated[lessonModal.sectionIdx] = sec;
		setCurriculum(updated);
		await saveCurriculum(updated);
		setLessonModal({ open: false, sectionIdx: 0, lessonIdx: null });
	};
	const deleteLesson = async (sectionIdx: number, lessonIdx: number) => {
		const updated = [...curriculum];
		const sec = { ...updated[sectionIdx], lessons: updated[sectionIdx].lessons.filter((_: any, i: number) => i !== lessonIdx) };
		updated[sectionIdx] = sec;
		setCurriculum(updated);
		await saveCurriculum(updated);
	};

	return (
		<>
			<Drawer
				title={
					<Space>
						<AppstoreOutlined style={{ color: '#1890ff' }} />
						<span>Curriculum Builder — <strong>{course?.title}</strong></span>
					</Space>
				}
				open={open}
				onClose={onClose}
				width={680}
				footer={
					<div style={{ textAlign: 'right' }}>
						<Button onClick={onClose}>Close</Button>
					</div>
				}
			>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
					<Text type='secondary'>{curriculum.length} sections · {curriculum.reduce((s, c) => s + (c.lessons?.length || 0), 0)} lessons total</Text>
					<Button type='primary' icon={<PlusOutlined />} onClick={openAddSection}>
						Add Section
					</Button>
				</div>

				{curriculum.length === 0 ? (
					<div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
						<AppstoreOutlined style={{ fontSize: 40, marginBottom: 12 }} />
						<div>No sections yet. Add your first section.</div>
					</div>
				) : (
					<Collapse accordion expandIconPosition='start' style={{ background: 'transparent' }}>
						{curriculum.map((section, sIdx) => (
							<Panel
								key={sIdx}
								header={
									<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: 12 }}>
										<Space>
											<Text strong>Section {sIdx + 1}: {section.title}</Text>
											<Tag>{section.lessons?.length || 0} lessons</Tag>
										</Space>
										<Space onClick={(e) => e.stopPropagation()}>
											<Tooltip title='Edit Section'>
												<Button type='text' size='small' icon={<EditOutlined />} onClick={() => openEditSection(sIdx)} />
											</Tooltip>
											<Popconfirm title='Delete this section?' onConfirm={() => deleteSection(sIdx)} okButtonProps={{ danger: true }}>
												<Button type='text' size='small' danger icon={<DeleteOutlined />} />
											</Popconfirm>
										</Space>
									</div>
								}
							>
								{/* Lessons list */}
								{(section.lessons || []).map((lesson: any, lIdx: number) => (
									<div
										key={lIdx}
										style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#fafafa', borderRadius: 8, marginBottom: 8, border: '1px solid #f0f0f0' }}
									>
										<Space>
											<div style={{ width: 28, height: 28, borderRadius: 6, background: '#e6f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#1890ff', fontWeight: 700 }}>
												{lIdx + 1}
											</div>
											<div>
												<Text style={{ fontSize: 13, fontWeight: 500 }}>{lesson.title}</Text>
												<div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
													{lesson.isFree && <Tag color='green' style={{ fontSize: 10 }}>Free</Tag>}
													{lesson.duration > 0 && <Text type='secondary' style={{ fontSize: 11 }}>{lesson.duration} min</Text>}
													{lesson.videoUrl && <Tag color='blue' style={{ fontSize: 10 }}>Video</Tag>}
												</div>
											</div>
										</Space>
										<Space>
											<Button type='text' size='small' icon={<EditOutlined />} onClick={() => openEditLesson(sIdx, lIdx)} />
											<Popconfirm title='Delete this lesson?' onConfirm={() => deleteLesson(sIdx, lIdx)} okButtonProps={{ danger: true }}>
												<Button type='text' size='small' danger icon={<DeleteOutlined />} />
											</Popconfirm>
										</Space>
									</div>
								))}

								{/* Add lesson button */}
								<Button
									type='dashed'
									icon={<PlusOutlined />}
									onClick={() => openAddLesson(sIdx)}
									block
									style={{ marginTop: 4 }}
								>
									Add Lesson
								</Button>
							</Panel>
						))}
					</Collapse>
				)}
			</Drawer>

			{/* Section Modal */}
			<Modal
				open={sectionModal.open}
				title={sectionModal.idx === null ? 'Add Section' : 'Edit Section'}
				onOk={handleSaveSection}
				onCancel={() => setSectionModal({ open: false, idx: null })}
				okText='Save'
			>
				<Form form={sectionForm} layout='vertical'>
					<Form.Item name='title' label='Section Title' rules={[{ required: true }]}>
						<Input placeholder='e.g. Introduction to JavaScript' />
					</Form.Item>
				</Form>
			</Modal>

			{/* Lesson Modal */}
			<Modal
				open={lessonModal.open}
				title={lessonModal.lessonIdx === null ? 'Add Lesson' : 'Edit Lesson'}
				onOk={handleSaveLesson}
				onCancel={() => setLessonModal({ open: false, sectionIdx: 0, lessonIdx: null })}
				okText='Save'
				width={520}
			>
				<Form form={lessonForm} layout='vertical'>
					<Form.Item name='title' label='Lesson Title' rules={[{ required: true }]}>
						<Input placeholder='e.g. Variables and Data Types' />
					</Form.Item>
					<Form.Item name='videoUrl' label='Video URL (optional)'>
						<Input placeholder='https://...' prefix={<UploadOutlined />} />
					</Form.Item>
					<div style={{ display: 'flex', gap: 12 }}>
						<Form.Item name='duration' label='Duration (minutes)' style={{ flex: 1 }}>
							<InputNumber min={0} style={{ width: '100%' }} placeholder='10' addonAfter='min' />
						</Form.Item>
						<Form.Item name='isFree' label='Free Preview' valuePropName='checked' initialValue={false} style={{ flex: 1 }}>
							<Switch />
						</Form.Item>
					</div>
				</Form>
			</Modal>
		</>
	);
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const InstructorCourses = () => {
	const { data, pagination, loading, refetch, page, pageSize, setPage, setPageSize } =
		usePaginatedFetch<InstructorCourse>('instructor-courses', (params) =>
			instructorCoursesApi.getMyCourses(params),
		);

	const [state, actions] = useFormModal();
	const [form] = Form.useForm();
	const [categories, setCategories] = useState<Category[]>([]);
	const [levels, setLevels] = useState<Level[]>([]);

	const [submitModal, setSubmitModal] = useState<{ open: boolean; course: InstructorCourse | null }>({
		open: false,
		course: null,
	});
	const [submitForm] = Form.useForm();
	const [submitLoading, setSubmitLoading] = useState(false);

	const [curriculumOpen, setCurriculumOpen] = useState(false);
	const [curriculumCourse, setCurriculumCourse] = useState<InstructorCourse | null>(null);

	useEffect(() => {
		categoriesApi
			.getCategories({ limit: 100 })
			.then((res: any) => {
				const cats = res?.data?.categories || res?.data || res || [];
				setCategories(Array.isArray(cats) ? cats : []);
			})
			.catch(() => setCategories([]));

		levelsApi
			.getLevels({ limit: 100 })
			.then((res: any) => {
				const lvls = res?.data?.levels || res?.data || res || [];
				setLevels(Array.isArray(lvls) ? lvls : []);
			})
			.catch(() => setLevels([]));
	}, []);

	const handleAdd = () => { form.resetFields(); actions.openModal(); };

	const handleEdit = (record: InstructorCourse) => {
		form.setFieldsValue({
			title: record.title,
			description: record.description,
			categoryId: (record as any).categoryId?._id || (record as any).categoryId,
			levelId: (record as any).levelId?._id || (record as any).levelId,
			price: record.price,
			discount: record.discount,
			duration: (record as any).duration,
			language: (record as any).language || 'Vietnamese',
			featured: record.featured,
		});
		actions.openModal({ ...record });
		actions.setDirty(false);
	};

	const handleDelete = async (id: string) => {
		try {
			await instructorCoursesApi.deleteCourse(id);
			message.success('Course deleted');
			refetch();
		} catch (err: any) {
			message.error(err?.message || 'Failed to delete course');
		}
	};

	const handleSave = async () => {
		try {
			const values = await form.validateFields();
			actions.setLoading(true);
			if (state.data?._id) {
				await instructorCoursesApi.updateCourse(state.data._id, values);
				message.success('Course updated');
			} else {
				await instructorCoursesApi.createCourse(values);
				message.success('Course created');
			}
			refetch();
			actions.closeModal();
		} catch (err: any) {
			message.error(err?.message || 'Failed to save course');
		} finally {
			actions.setLoading(false);
		}
	};

	const openSubmitForApproval = (course: InstructorCourse) => {
		submitForm.resetFields();
		setSubmitModal({ open: true, course });
	};

	const handleSubmitForApproval = async () => {
		try {
			const values = await submitForm.validateFields();
			setSubmitLoading(true);
			await instructorCoursesApi.submitForApproval({
				courseId: submitModal.course!._id,
				submissionType: values.submissionType,
				submissionNotes: values.submissionNotes,
			});
			message.success('Course submitted for approval!');
			setSubmitModal({ open: false, course: null });
			refetch();
		} catch (err: any) {
			message.error(err?.message || 'Failed to submit');
		} finally {
			setSubmitLoading(false);
		}
	};

	const columns: TableColumnType<InstructorCourse>[] = [
		{
			title: '#',
			key: 'index',
			align: 'center',
			width: 55,
			render: (_: any, __: any, index: number) => (page - 1) * pageSize + index + 1,
		},
		{
			title: 'Thumbnail',
			dataIndex: 'thumbnail',
			key: 'thumbnail',
			align: 'center',
			fixed: 'left',
			width: 80,
			render: (url: string) =>
				url ? (
					<img src={url} alt='thumb' style={{ width: 56, height: 38, objectFit: 'cover', borderRadius: 6 }} />
				) : (
					<div style={{ width: 56, height: 38, background: '#f0f0f0', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
						<BookOutlined style={{ color: '#aaa' }} />
					</div>
				),
		},
		{
			title: 'Title',
			dataIndex: 'title',
			key: 'title',
			fixed: 'left',
			width: 220,
			render: (text: string) => <Text strong style={{ fontSize: 13 }}>{text}</Text>,
		},
		{
			title: 'Price',
			key: 'price',
			width: 120,
			align: 'right',
			render: (_: any, record: InstructorCourse) =>
				record.price === 0 ? (
					<Tag color='green'>Free</Tag>
				) : (
					<div>
						{record.discount > 0 && (
							<div style={{ textDecoration: 'line-through', color: '#aaa', fontSize: 11 }}>
								{record.price.toLocaleString('vi-VN')}₫
							</div>
						)}
						<Text strong style={{ color: '#52c41a' }}>
							{Math.round(record.price * (1 - (record.discount || 0) / 100)).toLocaleString('vi-VN')}₫
						</Text>
					</div>
				),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			width: 110,
			align: 'center',
			render: (status: string) => <Tag color={statusColorMap[status] || 'default'}>{status?.toUpperCase()}</Tag>,
		},
		{
			title: 'Students',
			dataIndex: 'totalStudents',
			key: 'students',
			width: 90,
			align: 'center',
			render: (v: number) => <Tag color='blue'>{v ?? 0}</Tag>,
		},
		{
			title: 'Rating',
			key: 'rating',
			width: 90,
			align: 'center',
			render: (_: any, r: InstructorCourse) =>
				r.ratings?.count > 0 ? (
					<Tag color='gold'>⭐ {r.ratings.average.toFixed(1)}</Tag>
				) : '—',
		},
		{
			title: 'Actions',
			key: 'actions',
			align: 'center',
			fixed: 'right',
			width: 150,
			render: (_: any, record: InstructorCourse) => {
				const canSubmit = ['draft', 'rejected'].includes(record.status);
				return (
					<Space onClick={(e) => e.stopPropagation()}>
						<Tooltip title='Edit'>
							<Button type='text' size='small' icon={<EditOutlined />} onClick={() => handleEdit(record)} />
						</Tooltip>
						<Tooltip title='Curriculum'>
							<Button
								type='text'
								size='small'
								icon={<AppstoreOutlined style={{ color: '#722ed1' }} />}
								onClick={() => { setCurriculumCourse(record); setCurriculumOpen(true); }}
							/>
						</Tooltip>
						<Tooltip title={canSubmit ? 'Submit for Approval' : 'Already submitted'}>
							<Button
								type='text'
								size='small'
								icon={<SendOutlined style={{ color: canSubmit ? '#1890ff' : '#ccc' }} />}
								disabled={!canSubmit}
								onClick={() => openSubmitForApproval(record)}
							/>
						</Tooltip>
						<Popconfirm
							title='Delete Course?'
							description='This action cannot be undone.'
							onConfirm={() => handleDelete(record._id)}
							okText='Delete'
							cancelText='Cancel'
							okButtonProps={{ danger: true }}
						>
							<Button type='text' danger size='small' icon={<DeleteOutlined />} />
						</Popconfirm>
					</Space>
				);
			},
		},
	];

	return (
		<div>
			<PageHeader
				title='My Courses'
				total={pagination?.total}
				actions={
					<Space>
						<Button onClick={() => refetch()}>Refresh</Button>
						<Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
							New Course
						</Button>
					</Space>
				}
			/>

			<DataTable
				scroll={{ x: 1150 }}
				columns={columns}
				dataSource={data || []}
				loading={loading}
				rowKey='_id'
				tableLayout='fixed'
				pagination={{ current: page, pageSize, total: pagination?.total || 0 }}
				onChange={(p) => { setPage(p.current || 1); setPageSize(p.pageSize || 10); }}
				onRow={(record) => ({ onClick: () => handleEdit(record), style: { cursor: 'pointer' } })}
			/>

			{/* Add/Edit Course Modal */}
			<FormModal
				isOpen={state.isOpen}
				title={state.data?._id ? 'Edit Course' : 'Create New Course'}
				isDirty={state.isDirty}
				onClose={actions.closeModal}
				onSubmit={handleSave}
				loading={state.loading}
				okText={state.data?._id ? 'Save Changes' : 'Create Course'}
			>
				<Form form={form} layout='vertical' onValuesChange={() => actions.setDirty(true)}>
					<Form.Item name='title' label='Course Title' rules={[{ required: true }]}>
						<Input placeholder='e.g. JavaScript Fundamentals' />
					</Form.Item>
					<Form.Item name='description' label='Description' rules={[{ required: true }]}>
						<Input.TextArea rows={3} placeholder='What will students learn?' />
					</Form.Item>
					<Form.Item name='categoryId' label='Category' rules={[{ required: true }]}>
						<Select
							placeholder='Select category'
							showSearch
							optionFilterProp='label'
							options={categories.map((c) => ({ value: c._id, label: c.name }))}
						/>
					</Form.Item>
					<Form.Item name='levelId' label='Level'>
						<Select
							placeholder='Select level'
							allowClear
							showSearch
							optionFilterProp='label'
							options={levels.map((l) => ({ value: l._id, label: l.name }))}
						/>
					</Form.Item>
					<Form.Item name='duration' label='Duration (minutes)' rules={[{ required: true }, { type: 'number', min: 1 }]}>
						<InputNumber min={1} style={{ width: '100%' }} placeholder='120' addonAfter='min' />
					</Form.Item>
					<div style={{ display: 'flex', gap: 12 }}>
						<Form.Item name='price' label='Price (₫)' initialValue={0} style={{ flex: 1 }} rules={[{ required: true }]}>
							<InputNumber min={0} style={{ width: '100%' }} placeholder='0' addonBefore='₫' />
						</Form.Item>
						<Form.Item name='discount' label='Discount (%)' initialValue={0} style={{ flex: 1 }}>
							<InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter='%' />
						</Form.Item>
					</div>
					<Form.Item name='language' label='Language' initialValue='Vietnamese'>
						<Select>
							<Select.Option value='Vietnamese'>Vietnamese</Select.Option>
							<Select.Option value='English'>English</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item name='featured' label='Featured Course' valuePropName='checked' initialValue={false}>
						<Switch />
					</Form.Item>
				</Form>
			</FormModal>

			{/* Submit for Approval Modal */}
			<Modal
				open={submitModal.open}
				title={<><SendOutlined style={{ marginRight: 8, color: '#1890ff' }} />Submit for Approval</>}
				onCancel={() => setSubmitModal({ open: false, course: null })}
				onOk={handleSubmitForApproval}
				confirmLoading={submitLoading}
				okText='Submit'
			>
				<p style={{ color: '#6b7280', marginBottom: 16 }}>
					Course: <strong>{submitModal.course?.title}</strong>
				</p>
				<Form form={submitForm} layout='vertical'>
					<Form.Item name='submissionType' label='Submission Type' rules={[{ required: true }]} initialValue='new'>
						<Select>
							<Select.Option value='new'>New Course</Select.Option>
							<Select.Option value='update'>Content Update</Select.Option>
							<Select.Option value='revision'>Revision after Feedback</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item name='submissionNotes' label='Notes for Reviewers'>
						<Input.TextArea rows={3} placeholder='Any notes for the admin/reviewer...' />
					</Form.Item>
				</Form>
			</Modal>

			{/* Curriculum Builder */}
			<CurriculumDrawer
				open={curriculumOpen}
				course={curriculumCourse}
				onClose={() => { setCurriculumOpen(false); setCurriculumCourse(null); }}
			/>
		</div>
	);
};

export default InstructorCourses;
