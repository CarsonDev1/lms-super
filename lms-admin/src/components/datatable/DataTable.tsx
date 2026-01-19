import { ReactNode } from 'react';
import { Table, TableProps, TablePaginationConfig } from 'antd';
import './DataTable.scss';

interface DataTableProps<T> extends TableProps<T> {
	headerTitle?: string;
	headerActions?: ReactNode;
}

function DataTable<T extends object = any>({
	headerTitle,
	headerActions,
	pagination,
	scroll,
	...tableProps
}: DataTableProps<T>) {
	const paginationConfig: false | TablePaginationConfig = pagination
		? {
				showSizeChanger: true,
				showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
				pageSizeOptions: ['10', '20', '50', '100'],
				...(typeof pagination === 'object' ? pagination : {}),
			}
		: false;

	return (
		<div className='data-table-wrapper'>
			{(headerTitle || headerActions) && (
				<div className='data-table-header'>
					{headerTitle && <h2 className='data-table-title'>{headerTitle}</h2>}
					{headerActions && <div className='data-table-actions'>{headerActions}</div>}
				</div>
			)}
			<Table<T>
				{...tableProps}
				className={`data-table ${tableProps.className || ''}`}
				scroll={scroll}
				pagination={paginationConfig}
				bordered
			/>
		</div>
	);
}

export default DataTable;
