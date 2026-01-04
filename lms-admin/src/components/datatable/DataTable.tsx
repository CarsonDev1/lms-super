import { ReactNode, useRef, useEffect } from 'react';
import { Table, TableProps, TablePaginationConfig } from 'antd';
import './DataTable.scss';

interface DataTableProps<T> extends TableProps<T> {
	headerTitle?: string;
	headerActions?: ReactNode;
	showScrollTop?: boolean;
	scrollHeight?: number | string;
}

function DataTable<T extends object = any>({
	headerTitle,
	headerActions,
	showScrollTop = false,
	scrollHeight = 'calc(100vh - 320px)',
	pagination,
	scroll,
	...tableProps
}: DataTableProps<T>) {
	const tableRef = useRef<HTMLDivElement>(null);
	const topScrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!showScrollTop || !tableRef.current || !topScrollRef.current) return;

		const tableBody = tableRef.current.querySelector('.ant-table-body');
		const topScroll = topScrollRef.current;

		if (!tableBody) return;

		// Sync scroll positions
		const handleTableScroll = () => {
			topScroll.scrollLeft = tableBody.scrollLeft;
		};

		const handleTopScroll = () => {
			tableBody.scrollLeft = topScroll.scrollLeft;
		};

		tableBody.addEventListener('scroll', handleTableScroll);
		topScroll.addEventListener('scroll', handleTopScroll);

		// Update top scroll width to match table content width
		const updateTopScrollWidth = () => {
			const tableContent = tableBody.querySelector('table');
			if (tableContent) {
				(topScroll.firstElementChild as HTMLElement).style.width = `${tableContent.scrollWidth}px`;
			}
		};

		updateTopScrollWidth();
		const observer = new ResizeObserver(updateTopScrollWidth);
		observer.observe(tableBody);

		return () => {
			tableBody.removeEventListener('scroll', handleTableScroll);
			topScroll.removeEventListener('scroll', handleTopScroll);
			observer.disconnect();
		};
	}, [showScrollTop]);

	const paginationConfig: false | TablePaginationConfig = pagination
		? {
				showSizeChanger: true,
				showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
				pageSizeOptions: ['10', '20', '50', '100'],
				...(typeof pagination === 'object' ? pagination : {}),
		  }
		: false;

	return (
		<div className='data-table-wrapper' ref={tableRef}>
			{(headerTitle || headerActions) && (
				<div className='data-table-header'>
					{headerTitle && <h2 className='data-table-title'>{headerTitle}</h2>}
					{headerActions && <div className='data-table-actions'>{headerActions}</div>}
				</div>
			)}
			{showScrollTop && (
				<div className='top-scroll-wrapper' ref={topScrollRef}>
					<div className='top-scroll-content'></div>
				</div>
			)}
			<Table<T>
				{...tableProps}
				className={`data-table ${tableProps.className || ''}`}
				scroll={{
					y: scrollHeight,
					x: 'max-content',
					...scroll,
				}}
				pagination={paginationConfig}
			/>
		</div>
	);
}

export default DataTable;
