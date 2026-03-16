import { reviewsApi, Review } from '@/api/reviews';
import DataTable from '@/components/datatable/DataTable';
import PageHeader from '@/components/page-header/PageHeader';
import { usePaginatedFetch } from '@/hooks/useFetch';
import { DeleteOutlined, SafetyOutlined, StarFilled, SyncOutlined } from '@ant-design/icons';
import {
	Avatar,
	Button,
	Popconfirm,
	Rate,
	Select,
	Space,
	Tag,
	Tooltip,
	Typography,
	message,
} from 'antd';
import { TableColumnType } from 'antd';
import { useState } from 'react';

const { Text, Paragraph } = Typography;

const Reviews = () => {
	const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
	const [deleting, setDeleting] = useState<string | null>(null);

	const { data, pagination, loading, refetch, page, pageSize, setPage, setPageSize } =
		usePaginatedFetch<Review>(
			`reviews-${ratingFilter}`,
			(params) => reviewsApi.getAllReviews({ ...params, rating: ratingFilter }),
		);

	const handleDelete = async (id: string) => {
		setDeleting(id);
		try {
			await reviewsApi.deleteReview(id);
			message.success('Review deleted successfully');
			refetch();
		} catch {
			message.error('Failed to delete review');
		} finally {
			setDeleting(null);
		}
	};

	const columns: TableColumnType<Review>[] = [
		{
			title: '#',
			key: 'index',
			align: 'center',
			width: 55,
			render: (_: any, __: any, i: number) => (page - 1) * pageSize + i + 1,
		},
		{
			title: 'Student',
			key: 'user',
			width: 190,
			fixed: 'left',
			render: (_: any, record: Review) => (
				<Space>
					<Avatar src={record.userId?.avatar} size={32} style={{ background: '#722ed1' }}>
						{record.userId?.name?.[0]}
					</Avatar>
					<div>
						<div style={{ fontWeight: 600, fontSize: 13 }}>{record.userId?.name}</div>
						<Text type='secondary' style={{ fontSize: 11 }}>
							{record.userId?.email}
						</Text>
					</div>
				</Space>
			),
		},
		{
			title: 'Course',
			key: 'course',
			width: 220,
			render: (_: any, record: Review) => (
				<Space>
					{record.courseId?.thumbnail ? (
						<img
							src={record.courseId.thumbnail}
							style={{ width: 36, height: 26, objectFit: 'cover', borderRadius: 4 }}
							alt=''
						/>
					) : null}
					<Text style={{ fontSize: 13, fontWeight: 500 }}>{record.courseId?.title}</Text>
				</Space>
			),
		},
		{
			title: 'Rating',
			dataIndex: 'rating',
			key: 'rating',
			align: 'center',
			width: 140,
			render: (r: number) => (
				<Space direction='vertical' size={0} style={{ alignItems: 'center' }}>
					<Rate disabled defaultValue={r} style={{ fontSize: 14 }} />
					<Text style={{ fontSize: 12, color: '#faad14', fontWeight: 600 }}>{r}/5</Text>
				</Space>
			),
		},
		{
			title: 'Review',
			dataIndex: 'review',
			key: 'review',
			width: 280,
			render: (text: string) =>
				text ? (
					<Paragraph
						ellipsis={{ rows: 2, tooltip: text }}
						style={{ margin: 0, fontSize: 13, color: '#4b5563' }}
					>
						{text}
					</Paragraph>
				) : (
					<Text type='secondary'>No text</Text>
				),
		},
		{
			title: 'Verified',
			dataIndex: 'isVerifiedPurchase',
			key: 'verified',
			align: 'center',
			width: 90,
			render: (v: boolean) =>
				v ? (
					<Tag icon={<SafetyOutlined />} color='success'>
						Yes
					</Tag>
				) : (
					<Tag color='default'>No</Tag>
				),
		},
		{
			title: 'Helpful',
			dataIndex: 'helpfulCount',
			key: 'helpful',
			align: 'center',
			width: 80,
			render: (n: number) => <Tag color='blue'>{n}</Tag>,
		},
		{
			title: 'Date',
			dataIndex: 'createdAt',
			key: 'date',
			align: 'center',
			width: 110,
			render: (d: string) => new Date(d).toLocaleDateString('vi-VN'),
		},
		{
			title: 'Actions',
			key: 'actions',
			align: 'center',
			width: 75,
			fixed: 'right',
			render: (_: any, record: Review) => (
				<Popconfirm
					title='Delete this review?'
					description='This will update the course rating.'
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
			),
		},
	];

	return (
		<div>
			<PageHeader
				title='Reviews'
				total={pagination?.total}
				actions={
					<Space wrap>
						<Select
							placeholder='Filter by rating'
							allowClear
							style={{ width: 160 }}
							value={ratingFilter}
							onChange={(val) => { setRatingFilter(val); setPage(1); }}
						>
							{[5, 4, 3, 2, 1].map((r) => (
								<Select.Option key={r} value={r}>
									<Space>
										<StarFilled style={{ color: '#faad14' }} />
										{r} Star{r > 1 ? 's' : ''}
									</Space>
								</Select.Option>
							))}
						</Select>
						<Button icon={<SyncOutlined />} onClick={() => refetch()}>
							Refresh
						</Button>
					</Space>
				}
			/>

			<DataTable
				scroll={{ x: 1350 }}
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
			/>
		</div>
	);
};

export default Reviews;
