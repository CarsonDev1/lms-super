import { InstructorCourse, instructorCoursesApi } from '@/api/instructorCourses';
import { Category, categoriesApi } from '@/api/categories';
import { Level, levelsApi } from '@/api/levels';
import DataTable from '@/components/datatable/DataTable';
import PageHeader from '@/components/page-header/PageHeader';
import { usePaginatedFetch } from '@/hooks/useFetch';
import { BookOutlined, DeleteOutlined, EditOutlined, PlusOutlined, SendOutlined } from '@ant-design/icons';
import {
	Button,
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
	message,
} from 'antd';
import { TableColumnType } from 'antd';
import { useEffect, useState } from 'react';
import { FormModal, useFormModal } from '@/components/modal';

const statusColorMap: Record<string, string> = {
	draft: 'default',
	pending: 'warning',
	approved: 'success',
	published: 'success',
	archived: 'default',
	rejected: 'error',
};

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

	// Fetch categories and levels for dropdowns
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

	const handleAdd = () => {
		form.resetFields();
		actions.openModal();
	};

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
			title: 'Index',
			key: 'index',
			align: 'center',
			width: 60,
			render: (_: any, __: any, index: number) => (page - 1) * pageSize + index + 1,
		},
		{
			title: 'Thumbnail',
			dataIndex: 'thumbnail',
			key: 'thumbnail',
			align: 'center',
			fixed: 'left',
			width: 90,
			render: (url: string) =>
				url ? (
					<img src={url} alt='thumb' style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} />
				) : (
					<div
						style={{
							width: 60,
							height: 40,
							background: '#f0f0f0',
							borderRadius: 4,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							margin: '0 auto',
						}}
					>
						<BookOutlined style={{ color: '#aaa' }} />
					</div>
				),
		},
		{
			title: 'Title',
			dataIndex: 'title',
			key: 'title',
			fixed: 'left',
			width: 240,
			render: (text: string) => <strong>{text}</strong>,
		},
		{
			title: 'Price',
			key: 'price',
			width: 110,
			align: 'right',
			render: (_: any, record: InstructorCourse) =>
				record.price === 0 ? (
					<Tag color='green'>Free</Tag>
				) : (
					<span>
						{record.discount > 0 && (
							<span
								style={{ textDecoration: 'line-through', color: '#aaa', marginRight: 4, fontSize: 12 }}
							>
								${record.price}
							</span>
						)}
						<strong>${(record.price * (1 - (record.discount || 0) / 100)).toFixed(0)}</strong>
					</span>
				),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			width: 100,
			align: 'center',
			render: (status: string) => <Tag color={statusColorMap[status] || 'default'}>{status?.toUpperCase()}</Tag>,
		},
		{
			title: 'Students',
			dataIndex: 'totalStudents',
			key: 'students',
			width: 90,
			align: 'center',
		},
		{
			title: 'Rating',
			key: 'rating',
			width: 90,
			align: 'center',
			render: (_: any, record: InstructorCourse) =>
				record.ratings?.count > 0 ? `⭐ ${record.ratings.average.toFixed(1)}` : '—',
		},
		{
			title: 'Actions',
			key: 'actions',
			align: 'center',
			fixed: 'right',
			width: 120,
			render: (record: InstructorCourse) => {
				const canSubmit = ['draft', 'rejected'].includes(record.status);
				return (
					<Space onClick={(e) => e.stopPropagation()}>
						<Tooltip title='Edit'>
							<Button
								type='text'
								size='small'
								icon={<EditOutlined />}
								onClick={() => handleEdit(record)}
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
							title='Delete Course'
							description='This action cannot be undone.'
							onConfirm={() => handleDelete(record._id)}
							okText='Yes'
							cancelText='No'
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
					<div className='actions'>
						<Button onClick={() => refetch()}>Refresh</Button>
						<Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
							New Course
						</Button>
					</div>
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
				onChange={(p) => {
					setPage(p.current || 1);
					setPageSize(p.pageSize || 10);
				}}
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
					<Form.Item
						name='title'
						label='Course Title'
						rules={[{ required: true, message: 'Please enter title' }]}
					>
						<Input placeholder='e.g. JavaScript Fundamentals' />
					</Form.Item>

					<Form.Item
						name='description'
						label='Description'
						rules={[{ required: true, message: 'Please enter description' }]}
					>
						<Input.TextArea rows={3} placeholder='What will students learn?' />
					</Form.Item>

					<Form.Item
						name='categoryId'
						label='Category'
						rules={[{ required: true, message: 'Please select a category' }]}
					>
						<Select
							placeholder='Select category'
							showSearch
							optionFilterProp='label'
							options={categories.map((c) => ({ value: c._id, label: c.name }))}
							loading={categories.length === 0}
						/>
					</Form.Item>

					<Form.Item name='levelId' label='Level (optional)'>
						<Select
							placeholder='Select level'
							allowClear
							showSearch
							optionFilterProp='label'
							options={levels.map((l) => ({ value: l._id, label: l.name }))}
						/>
					</Form.Item>

					<Form.Item
						name='duration'
						label='Duration (minutes)'
						rules={[
							{ required: true, message: 'Please enter total duration' },
							{ type: 'number', min: 1, message: 'Duration must be at least 1 minute' },
						]}
					>
						<InputNumber min={1} style={{ width: '100%' }} placeholder='e.g. 120' addonAfter='min' />
					</Form.Item>

					<div style={{ display: 'flex', gap: 12 }}>
						<Form.Item
							name='price'
							label='Price ($)'
							initialValue={0}
							style={{ flex: 1 }}
							rules={[{ required: true, message: 'Price is required' }]}
						>
							<InputNumber min={0} style={{ width: '100%' }} placeholder='0' addonBefore='$' />
						</Form.Item>
						<Form.Item name='discount' label='Discount (%)' initialValue={0} style={{ flex: 1 }}>
							<InputNumber min={0} max={100} style={{ width: '100%' }} placeholder='0' addonAfter='%' />
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
				title={
					<>
						<SendOutlined style={{ marginRight: 8, color: '#1890ff' }} />
						Submit for Approval
					</>
				}
				onCancel={() => setSubmitModal({ open: false, course: null })}
				onOk={handleSubmitForApproval}
				confirmLoading={submitLoading}
				okText='Submit'
			>
				<p style={{ color: '#6b7280', marginBottom: 16 }}>
					Course: <strong>{submitModal.course?.title}</strong>
				</p>
				<Form form={submitForm} layout='vertical'>
					<Form.Item
						name='submissionType'
						label='Submission Type'
						rules={[{ required: true }]}
						initialValue='new'
					>
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
		</div>
	);
};

export default InstructorCourses;
