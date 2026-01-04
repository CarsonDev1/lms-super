import { ReactNode } from 'react';
import './PageHeader.scss';

interface PageHeaderProps {
	title: string;
	total?: number;
	actions?: ReactNode;
}

function PageHeader({ title, total, actions }: PageHeaderProps) {
	return (
		<div className='page-header'>
			<h1>
				{title}
				{total !== undefined && <span className='total'>({total})</span>}
			</h1>
			{actions && <div className='actions'>{actions}</div>}
		</div>
	);
}

export default PageHeader;
