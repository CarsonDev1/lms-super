import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './App.tsx';
import './styles/index.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ConfigProvider
			theme={{
				token: {
					colorPrimary: '#0071f9',
					colorLink: '#0071f9',
					borderRadius: 8,
					colorBgContainer: '#ffffff',
				},
				components: {
					Table: {
						headerBg: 'rgb(240,247,255)',
						headerColor: '#0057c8',
						borderColor: 'rgba(92,156,233,0.4)',
					},
					Button: { borderRadius: 8 },
					Card: { borderRadius: 14 },
					Modal: { borderRadius: 16 },
				},
			}}
		>
			<App />
		</ConfigProvider>
	</React.StrictMode>
);
