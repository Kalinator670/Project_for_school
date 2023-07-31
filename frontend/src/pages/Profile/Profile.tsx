import { FC, useState } from 'react';
import { Button, Card, Tabs, Typography, Table, Progress, Modal, Form, Input, Checkbox } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Radar } from '@ant-design/charts';
import { useAppSelector } from '../../redux/hooks';
import { logout, selectUser } from '../../redux/features/userSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetAllUserStatQuery, useGetAllUserTasksQuery } from '../../redux/api/taskApi';
import { useEditUserMutation, useRefreshUserMutation } from '../../redux/api/authApi';

const { Paragraph } = Typography;

interface DataType {
	id: number;
	name: string;
	progress: number;
	rating: number;
}

const columns: ColumnsType<DataType> = [
	{
		title: 'Имя задачи',
		dataIndex: 'name',
		key: 'name',
		render: (text) => <p>{text}</p>,
	},
	{
		title: 'Прогноз',
		dataIndex: 'TaskUser',
		key: 'predicted',
		render: (item) => Object.values(item)[0],
	},
	{
		title: 'Экспертная оценка',
		dataIndex: 'TaskUser',
		key: 'rating',
		render: (item) => item.rate.rating === 0 ? <p>Нет</p> : item.rate.rating,
	},

];






const Profile: FC = (props) => {
	const { user, token } = useAppSelector(selectUser);
	const dispatch = useDispatch()
	const navigate = useNavigate();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [refreshUser, {isLoading, isSuccess: refreshSuccess, isError, error }] = useRefreshUserMutation();
	const showModal = () => {
		setIsModalOpen(true);
	};
	const [currentVAR, setCurrentVAR] = useState(1);
	const [currentINVAR, setCurrentINVAR] = useState(1);
	const { data: dataVar, isSuccess: isSuccessVar, refetch: refetchVar } = useGetAllUserTasksQuery({ limit: '8', type: 'VAR', page: `${currentVAR}` })
	const { data: dataINVAR, isSuccess: isSuccessINVAR, refetch: refetchINVAR } = useGetAllUserTasksQuery({ limit: '8', type: 'INVAR', page: `${currentINVAR}` })
	const { data: dataStatVar, isSuccess: isSuccessStatVar, refetch: refetchStatVar } = useGetAllUserStatQuery({ type: 'VAR'})
	const { data: dataStatINVAR, isSuccess: isSuccessStatINVAR, refetch: refetchStatINVAR } = useGetAllUserStatQuery({ type: 'INVAR'})
	const [editUser] = useEditUserMutation();
	const onLogout = () => {
		dispatch(logout())
		navigate('/')
	}
	if (!user) {
		return null;
	}
	const config = {
		data: dataStatVar,
		xField: 'item',
		yField: 'score',
		seriesField: 'user',
		meta: {
			score: {
				alias: '123',
				min: 0,
				max: 100,
			},
		},
		xAxis: {
			line: null,
			tickLine: null,
			grid: {
				line: {
					style: {
						lineDash: null,
					},
				},
			},
		},
		yAxis: {
			line: null,
			tickLine: null,
			grid: {
				line: {
					type: 'line',
					style: {
						lineDash: null,
					},
				},
			},
		},
		point: {
			size: 3,
		},
	};
	const config1 = {
		data: dataStatINVAR,
		xField: 'item',
		yField: 'score',
		seriesField: 'user',
		meta: {
			score: {
				alias: '123',
				min: 0,
				max: 100,
			},
		},
		xAxis: {
			line: null,
			tickLine: null,
			grid: {
				line: {
					style: {
						lineDash: null,
					},
				},
			},
		},
		yAxis: {
			line: null,
			tickLine: null,
			grid: {
				line: {
					type: 'line',
					style: {
						lineDash: null,
					},
				},
			},
		},
		point: {
			size: 3,
		},
	};

	function onFinish(values) {
		editUser(values)
		.then(()=>{
			refreshUser({token: token})
			setIsModalOpen(false)
		})

	}

	return <div style={{ width: "100%", maxWidth: "1024px", height: "100%", padding: "32px 32px", background: "#FFFFFF", borderRadius: "32px", boxShadow: "28px 0px 50.4863px rgba(0, 0, 0, 0.17)", justifyContent: "center" }}>


		<Tabs
			defaultActiveKey="1"
			items={[
				{
					label: 'Информация',
					key: '1',
					children: <Card title={user.name} bordered={true} style={{ width: "100%", marginBottom: "32px" }}>
						<Paragraph>Права пользователя: {user.role == "ADMIN" ? "Администратор" : "Пользователь"} </Paragraph>
						<Paragraph><Button onClick={showModal} type="primary">Редактировать</Button> <Button onClick={onLogout} type="dashed">Выйти</Button></Paragraph>
					</Card>,
				},
				{
					label: 'Инвариантные задачи',
					key: '2',
					children: <div> <Table size='small' columns={columns} dataSource={isSuccessINVAR ? dataINVAR.rows : null} rowKey="id" /> </div>,
				},
				{
					label: 'Вариативные задачи',
					key: '3',
					children: <div> <Table size='small' columns={columns} dataSource={isSuccessVar ? dataVar.rows : null} rowKey="id" /> </div>,
				},
				{
					label: 'Инвариантная статистика ',
					key: '4',
					children: <>{isSuccessStatINVAR && dataStatINVAR.length >= 6 ? <Radar style={{ height: "500px" }} {...config1} /> : 'Добавьте больше задач чтобы видеть статистику'}</>,
				},
				{
					label: 'Вариативная статистика',
					key: '5',
					children: <>{isSuccessStatVar && dataStatVar.length >= 6 ? <Radar style={{ height: "500px" }} {...config} /> : 'Добавьте больше задач чтобы видеть статистику'}</>,
				},
			]}
		/>
		<Modal title="Редактирование пользователя" open={isModalOpen} footer={null}
			onCancel={() => setIsModalOpen(false)}>
			<Form
				name="basic"
				style={{ maxWidth: 600 }}
				layout='vertical'
				initialValues={{ remember: true }}
				onFinish={onFinish}
				autoComplete="off"
			>
				<Form.Item
					label="Почта"
					name="email"
					rules={[{ required: true, message: 'Пожалуйста введите свою почту!' }]}
				>
					<Input defaultValue={user.email} />
				</Form.Item>

				<Form.Item
					label="ФИО"
					name="name"
					rules={[{ required: true, message: 'Пожалуйста введите свое имя!' }]}
				>
					<Input defaultValue={user.name} />
				</Form.Item>

				<Form.Item
					label="Пароль"
					name="password"
					rules={[{ required: true, message: 'Пожалуйста введите новый пароль!' }]}
				>
					<Input.Password />
				</Form.Item>
				<Form.Item >
					<Button type="primary" htmlType="submit">
						Подтвердить
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	</div>;
};
export default Profile;