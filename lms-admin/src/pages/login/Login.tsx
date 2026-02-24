import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi, LoginRequest } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import Logo from '@/assets/images/logo.png';
import './Login.scss';

function Login() {
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();
	const navigate = useNavigate();
	const setAuth = useAuthStore((state) => state.setAuth);

	const onFinish = async (values: LoginRequest) => {
		setLoading(true);
		try {
			const response = await authApi.login(values);
			setAuth(response.data.user, response.data.accessToken);
			message.success('Login successful!');
			navigate('/');
		} catch (error: any) {
			message.error(error?.message || 'Login failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='login-container'>
			<Card className='login-card'>
				<img src={Logo} alt='LMS Admin Logo' className='login-logo' />
				<h2 className='login-title'>Welcome to LMS Admin</h2>
				<Form
					form={form}
					name='login'
					onFinish={onFinish}
					autoComplete='off'
					layout='vertical'
					style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
				>
					<Form.Item
						name='email'
						rules={[
							{ required: true, message: 'Please input your email!' },
							{ type: 'email', message: 'Please enter a valid email!' },
						]}
					>
						<Input
							prefix={<UserOutlined />}
							placeholder='Email'
							size='large'
							onPressEnter={() => form.submit()}
						/>
					</Form.Item>

					<Form.Item name='password' rules={[{ required: true, message: 'Please input your password!' }]}>
						<Input.Password
							prefix={<LockOutlined />}
							placeholder='Password'
							size='large'
							onPressEnter={() => form.submit()}
						/>
					</Form.Item>

					<Form.Item>
						<Button type='primary' htmlType='submit' loading={loading} block size='large'>
							Log in
						</Button>
					</Form.Item>
				</Form>
			</Card>
		</div>
	);
}

export default Login;
