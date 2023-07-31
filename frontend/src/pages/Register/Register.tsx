import React, { FC } from 'react';
import { Button, Checkbox, Form, Input, Select, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { object, string, TypeOf } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegisterUserMutation } from '../../redux/api/authApi';
import { toast } from 'react-toastify';


const registerSchema = object({
	name: string().min(1, 'Full name is required').max(100),
	email: string()
		.min(1, 'Email address is required')
		.email('Email Address is invalid'),
	role: string().min(1, 'Role is required').max(100),
	password: string()
		.min(1, 'Password is required')
		.min(8, 'Password must be more than 8 characters')
		.max(32, 'Password must be less than 32 characters'),
	passwordConfirm: string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.passwordConfirm, {
	path: ['passwordConfirm'],
	message: 'Passwords do not match',
});

export type RegisterInput = TypeOf<typeof registerSchema>;

const Register= (props: {modal: any}) => {
	const [messageApi, contextHolder] = message.useMessage();
	const [form] = Form.useForm();
	const methods = useForm<RegisterInput>({
		resolver: zodResolver(registerSchema),
	});

	const onSubmitHandler: SubmitHandler<RegisterInput> = (values) => {
		registerUser(values);
	};

	const [registerUser, { isLoading, isSuccess, error, isError }] = useRegisterUserMutation();
	const {
		reset,
		handleSubmit,
		control,
		formState: { isSubmitSuccessful },
	} = methods;

	React.useEffect(() => {
		if (isSuccess) {
			toast.success('User registered successfully');
			props.modal()
		}

		if (isError) {
			console.log(error);
			if (Array.isArray((error as any).data.error)) {
				(error as any).data.error.forEach((el: any) =>
					toast.error(el.message, {
						position: 'top-right',
					})
				);
			} else {
				toast.error((error as any).data.message, {
					position: 'top-right',
				});
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading]);

	React.useEffect(() => {
		if (isSubmitSuccessful) {
			reset();
		}

	}, [isSubmitSuccessful]);

	return (

		<Form
			style={{ margin: "auto 0px" }}
			scrollToFirstError
			onFinish={handleSubmit(onSubmitHandler)}
			form={form}
			layout="vertical"
		>
			<Controller
				name="name"
				control={control}
				render={({
					field: { onChange, onBlur, value, ref },
					fieldState: { error },
				}) => {
					return (
						<>
							<Form.Item name="name" label="Имя" rules={[
								{
									required: true,
									message: 'Пожалуйста введите ФИО!',
								},
							]}>
								<Input
									onChange={onChange}
									onBlur={onBlur}
									value={value}
									ref={ref}
									placeholder="Введите свое ФИО"
								/>
							</Form.Item>
						</>
					);
				}}
			/>
			<Controller
				name="email"
				control={control}
				render={({
					field: { onChange, onBlur, value, ref },
					fieldState: { error },
				}) => {
					return (
						<>
							<Form.Item name="email" label="Почта" rules={[
								{
									type: 'email',
									message: 'The input is not valid E-mail!',
								},
								{
									required: true,
									message: 'Пожалуйста введите почту!',
								},
							]}>
								<Input
									onChange={onChange}
									onBlur={onBlur}
									value={value}
									ref={ref}
									placeholder="Введите свою почту"
								/>
							</Form.Item>
						</>
					);
				}}
			/>

			<Controller
				name="role"
				control={control}
				render={({
					field: { onChange, onBlur, value, ref },
					fieldState: { error },
				}) => {
					return (
						<>
							<Form.Item label="Роль">
								<Select
									onChange={onChange}
									onBlur={onBlur}
									value={value}
									ref={ref}
									options={[
										{ value: 'USER', label: 'Педагог' },
										{ value: 'EXPERT', label: 'Эксперт' },
										{ value: 'ADMIN', label: 'Администратор' },
									]}
								/>
							</Form.Item>
						</>
					);
				}}
			/>

			<Controller
				name="password"
				control={control}
				render={({
					field: { onChange, onBlur, value, ref },
					fieldState: { error },
				}) => {
					return (
						<>
							<Form.Item
								name="password"
								label="Пароль"
								rules={[
									{
										required: true,
										message: 'Пожалуйста введите пароль!',
									},
								]}
								hasFeedback
							>
								<Input.Password
									onChange={onChange}
									onBlur={onBlur}
									value={value}
									ref={ref}
									placeholder="Придумайте пароль"
									iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
								/>
							</Form.Item>
						</>
					);
				}}
			/>

			<Controller
				name="passwordConfirm"
				control={control}
				render={({
					field: { onChange, onBlur, value, ref },
					fieldState: { error },
				}) => {
					return (
						<>
							<Form.Item
								name="confirm"
								label="Подтвердите пароль"
								rules={[
									{
										required: true,
										message: 'Пожалуйста подтвердите пароль!',
									},
									({ getFieldValue }) => ({
										validator(_, value) {
											if (!value || getFieldValue('password') === value) {
												return Promise.resolve();
											}
											return Promise.reject(new Error('Эти пароли не совпадают'));
										},
									}),
								]}
								hasFeedback
							>
								<Input.Password
									onChange={onChange}
									onBlur={onBlur}
									value={value}
									ref={ref}
									placeholder="Повторите пароль"
									iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
								/>
							</Form.Item>
						</>
					);
				}}
			/>
			<Form.Item>
				<Button htmlType='submit' style={{ maxWidth: "300px", minWidth: "100%" }} >Зарегистрироваться</Button>
			</Form.Item>

		</Form>
	)
};
export default Register;