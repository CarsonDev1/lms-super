import { useEffect, useState } from 'react';
import {
	Alert,
	Avatar,
	Button,
	Card,
	Col,
	Divider,
	Form,
	Input,
	Row,
	Spin,
	Tag,
	Typography,
	Upload,
	message,
} from 'antd';
import {
	CameraOutlined,
	LockOutlined,
	SaveOutlined,
	UserOutlined,
} from '@ant-design/icons';
import apiClient from '@/api/client';
import { uploadApi } from '@/api/upload';
import { useAuthStore } from '@/stores/authStore';
import PageHeader from '@/components/page-header/PageHeader';
import type { UploadChangeParam } from 'antd/es/upload';
import './Settings.scss';

const { Title, Text } = Typography;

const roleColors: Record<string, string> = {
	admin: 'red',
	instructor: 'blue',
	student: 'green',
	reviewer: 'purple',
};

const Settings = () => {
	const { user, setAuth, token } = useAuthStore();
	const [profile, setProfile] = useState<any>(null);
	const [loadingProfile, setLoadingProfile] = useState(true);
	const [profileForm] = Form.useForm();
	const [passwordForm] = Form.useForm();
	const [savingProfile, setSavingProfile] = useState(false);
	const [savingPassword, setSavingPassword] = useState(false);
	const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
	const [avatarUploading, setAvatarUploading] = useState(false);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				setLoadingProfile(true);
				const res: any = await apiClient.get('/auth/me');
				const data = res?.data?.data?.user || res?.data?.user || res?.data?.data || res?.data || res;
				setProfile(data);
				setAvatarUrl(data?.avatar);
				profileForm.setFieldsValue({
					name: data?.name,
					email: data?.email,
					phone: data?.phone,
					bio: data?.bio,
				});
			} catch {
				message.error('Failed to load profile');
			} finally {
				setLoadingProfile(false);
			}
		};
		fetchProfile();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSaveProfile = async () => {
		try {
			const values = await profileForm.validateFields();
			setSavingProfile(true);
			const payload = { ...values, avatar: avatarUrl };
			const res: any = await apiClient.put('/auth/profile', payload);
			const updated = res?.data?.data || res?.data || res;
			setProfile(updated);
			// Update auth store so header reflects the change
			if (token) {
				setAuth({ ...user, ...updated, name: values.name, avatar: avatarUrl } as any, token);
			}
			message.success('Profile updated successfully');
		} catch (err: any) {
			message.error(err?.message || 'Failed to update profile');
		} finally {
			setSavingProfile(false);
		}
	};

	const handleChangePassword = async () => {
		try {
			const values = await passwordForm.validateFields();
			if (values.newPassword !== values.confirmPassword) {
				message.error('Passwords do not match');
				return;
			}
			setSavingPassword(true);
			await apiClient.post('/auth/change-password', {
				currentPassword: values.currentPassword,
				newPassword: values.newPassword,
			});
			message.success('Password changed successfully');
			passwordForm.resetFields();
		} catch (err: any) {
			message.error(err?.response?.data?.message || err?.message || 'Failed to change password');
		} finally {
			setSavingPassword(false);
		}
	};

	const handleAvatarChange = async (info: UploadChangeParam) => {
		const file = info.file.originFileObj;
		if (!file) return;
		setAvatarUploading(true);
		try {
			const res: any = await uploadApi.uploadImage(file);
			const url = res?.data?.url || res?.url;
			if (url) {
				setAvatarUrl(url);
				message.success('Avatar uploaded');
			}
		} catch {
			message.error('Failed to upload avatar');
		} finally {
			setAvatarUploading(false);
		}
	};

	return (
		<div className='settings-page'>
			<PageHeader title='Settings & Profile' />

			{loadingProfile ? (
				<div style={{ textAlign: 'center', padding: 80 }}>
					<Spin size='large' />
				</div>
			) : (
				<Row gutter={[24, 24]}>
					{/* ── Left: Avatar + Summary ── */}
					<Col xs={24} md={7} lg={6}>
						<Card
							style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', textAlign: 'center' }}
							styles={{ body: { padding: '32px 24px' } }}
						>
							<div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
								<Avatar
									size={100}
									src={avatarUrl}
									style={{ background: '#1890ff', fontSize: 40 }}
									icon={<UserOutlined />}
								/>
								<Upload
									showUploadList={false}
									accept='image/*'
									beforeUpload={() => false}
									onChange={handleAvatarChange}
								>
									<Button
										size='small'
										shape='circle'
										icon={<CameraOutlined />}
										loading={avatarUploading}
										style={{
											position: 'absolute',
											bottom: 0,
											right: 0,
											background: '#1890ff',
											color: '#fff',
											border: 'none',
										}}
									/>
								</Upload>
							</div>

							<Title level={4} style={{ margin: '8px 0 4px' }}>
								{profile?.name}
							</Title>
							<Text type='secondary' style={{ fontSize: 13 }}>
								{profile?.email}
							</Text>
							<div style={{ marginTop: 12 }}>
								<Tag color={roleColors[profile?.role] || 'default'} style={{ fontSize: 13, padding: '2px 12px' }}>
									{profile?.role?.toUpperCase()}
								</Tag>
							</div>

							<Divider style={{ margin: '20px 0' }} />

							<div style={{ textAlign: 'left' }}>
								{[
									{ label: 'Member Since', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : '—' },
									{ label: 'Last Login', value: profile?.lastLogin ? new Date(profile.lastLogin).toLocaleDateString('vi-VN') : '—' },
									{ label: 'Status', value: profile?.isActive ? 'Active' : 'Inactive' },
								].map((item) => (
									<div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
										<Text type='secondary' style={{ fontSize: 12 }}>{item.label}</Text>
										<Text style={{ fontSize: 12, fontWeight: 500 }}>{item.value}</Text>
									</div>
								))}
							</div>
						</Card>
					</Col>

					{/* ── Right: Profile Form + Password ── */}
					<Col xs={24} md={17} lg={18}>
						<Card
							title={
								<span style={{ fontWeight: 700, fontSize: 16 }}>
									<UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
									Profile Information
								</span>
							}
							style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: 24 }}
							styles={{ body: { padding: '24px' } }}
						>
							<Form form={profileForm} layout='vertical'>
								<Row gutter={16}>
									<Col xs={24} sm={12}>
										<Form.Item
											name='name'
											label='Full Name'
											rules={[{ required: true, message: 'Name is required' }, { min: 2, message: 'Name too short' }]}
										>
											<Input prefix={<UserOutlined style={{ color: '#bbb' }} />} placeholder='Your full name' />
										</Form.Item>
									</Col>
									<Col xs={24} sm={12}>
										<Form.Item name='email' label='Email Address'>
											<Input disabled prefix={<UserOutlined style={{ color: '#bbb' }} />} />
										</Form.Item>
									</Col>
									<Col xs={24} sm={12}>
										<Form.Item name='phone' label='Phone Number'>
											<Input placeholder='+84 xxx xxx xxxx' />
										</Form.Item>
									</Col>
									<Col xs={24}>
										<Form.Item name='bio' label='Bio'>
											<Input.TextArea
												rows={3}
												placeholder='Tell us a little about yourself...'
												maxLength={500}
												showCount
											/>
										</Form.Item>
									</Col>
								</Row>
								<Button
									type='primary'
									icon={<SaveOutlined />}
									loading={savingProfile}
									onClick={handleSaveProfile}
								>
									Save Profile
								</Button>
							</Form>
						</Card>

						<Card
							title={
								<span style={{ fontWeight: 700, fontSize: 16 }}>
									<LockOutlined style={{ marginRight: 8, color: '#722ed1' }} />
									Change Password
								</span>
							}
							style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
							styles={{ body: { padding: '24px' } }}
						>
							<Alert
								type='info'
								message='Password requirements: minimum 6 characters.'
								style={{ marginBottom: 20, borderRadius: 8 }}
								showIcon
							/>
							<Form form={passwordForm} layout='vertical'>
								<Row gutter={16}>
									<Col xs={24} sm={12}>
										<Form.Item
											name='currentPassword'
											label='Current Password'
											rules={[{ required: true, message: 'Current password is required' }]}
										>
											<Input.Password placeholder='Enter current password' />
										</Form.Item>
									</Col>
								</Row>
								<Row gutter={16}>
									<Col xs={24} sm={12}>
										<Form.Item
											name='newPassword'
											label='New Password'
											rules={[
												{ required: true, message: 'New password is required' },
												{ min: 6, message: 'Minimum 6 characters' },
											]}
										>
											<Input.Password placeholder='Enter new password' />
										</Form.Item>
									</Col>
									<Col xs={24} sm={12}>
										<Form.Item
											name='confirmPassword'
											label='Confirm New Password'
											rules={[
												{ required: true, message: 'Please confirm password' },
												({ getFieldValue }) => ({
													validator(_, value) {
														if (!value || getFieldValue('newPassword') === value) {
															return Promise.resolve();
														}
														return Promise.reject(new Error('Passwords do not match'));
													},
												}),
											]}
										>
											<Input.Password placeholder='Confirm new password' />
										</Form.Item>
									</Col>
								</Row>
								<Button
									type='primary'
									icon={<LockOutlined />}
									loading={savingPassword}
									onClick={handleChangePassword}
									style={{ background: '#722ed1', borderColor: '#722ed1' }}
								>
									Update Password
								</Button>
							</Form>
						</Card>
					</Col>
				</Row>
			)}
		</div>
	);
};

export default Settings;
