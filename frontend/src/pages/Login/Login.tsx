import React, { FC } from 'react';
import { Button, Divider, Form, Input } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { object, string, TypeOf } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoginUserMutation } from '../../redux/api/authApi';
import { toast } from 'react-toastify';
//#TODO add recover pass

const loginSchema = object({
	email: string()
		.min(1, 'Email address is required')
		.email('Email Address is invalid'),
	password: string()
		.min(1, 'Password is required')
		.min(6, 'Password must be more than 8 characters')
		.max(32, 'Password must be less than 32 characters'),
});

export type LoginInput = TypeOf<typeof loginSchema>;

const Login: FC = () => {
	const [form] = Form.useForm();

	const methods = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
	});

	const [loginUser, { isLoading, isError, error, isSuccess }] =
    useLoginUserMutation();

	const {
		control,
		reset,
		handleSubmit,
		formState: { isSubmitSuccessful },
	} = methods;

	const navigate = useNavigate();
	const location = useLocation();

	const from = ((location.state as any)?.from.pathname as string) || '/profile';

	React.useEffect(() => {
		if (isSuccess) {
		  toast.success('Вы успешно вошли!');
		  navigate(from);		  
		}
		if (isError) {
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	  }, [isSubmitSuccessful]);
	  
	  const user = JSON.parse(localStorage.getItem('user') || "{}")
	  React.useEffect(() => {
		if (user.token) {
			navigate("/profile")
		}
	  },[])

	  const onSubmitHandler: SubmitHandler<LoginInput> = (values) => {
		// ? Executing the loginUser Mutation
		loginUser(values);
	  };

	return (
		<div style={{ display: 'flex', margin: "0px auto", width: "100%", maxWidth: "800px", height: '94vh', background: "#FFFFFF", borderRadius: "32px", boxShadow: "28px 0px 50.4863px rgba(0, 0, 0, 0.17)", textAlign: 'center', justifyContent: 'center' }}>
			<Form
				style={{ maxWidth: "300px", minWidth: "270px", margin: "auto 0px" }}
				form={form}
				scrollToFirstError
				onFinish={handleSubmit(onSubmitHandler)}
				layout="vertical"
			>
				<Controller
					name="email"
					control={control}
					render={({
						field: { onChange, onBlur, value, ref },
						fieldState: { error },
					}) => {
						return (
							<>
								<Form.Item
									name='email'
									label="Почта"
									rules={[
										{
											type: 'email',
											message: 'Введите свою почту правильно',
										},
										{
											required: true,
											message: 'Пожалуйста введите почту!',
										},
									]}
								>
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
								>
									<Input.Password
										onChange={onChange}
										onBlur={onBlur}
										value={value}
										ref={ref}
										placeholder="Введите свой пароль"
										iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
									/>
								</Form.Item>
							</>
						);
					}}
				/>
				<Form.Item>
					<Button htmlType="submit" style={{ maxWidth: "300px", minWidth: "100%" }} type="primary">Войти</Button>
				</Form.Item>
			</Form>
		</div>
	)
};
export default Login;