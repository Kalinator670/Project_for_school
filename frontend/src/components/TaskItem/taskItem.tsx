import avatar from "../../assets/Avatar.png";
import { Avatar, Button, Card, Col, Divider, InputNumber, Modal, Popconfirm, Row } from 'antd';
import { ProjectTwoTone } from '@ant-design/icons';
import React, { useEffect, useState } from "react";
import varTaskLogo from '../../assets/Задачи вариативные.png';
import invarTaskLogo from '../../assets/Задачи инвариантные.png';
import { useAddUserMutation, useDeleteTaskMutation } from "../../redux/api/taskApi";
import Table, { ColumnsType } from "antd/es/table";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
const { Meta } = Card;

interface DataType {
	id: number;
	name: string;
	TaskUser: number;
	rating: number;
}

const columns: ColumnsType<DataType> = [
	{
		title: 'ФИО',
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

export const TaskItem = ({ item, refetch, user }) => {
	const [addUser, { isError, error }] = useAddUserMutation();
	const [delTask] = useDeleteTaskMutation();
	const [modalOpen, setModalOpen] = useState(false);
	const [predict, setPredict] = useState<string | number | null>(100);
	const onClick = (contentId: string) => {
		addUser({ contentId, predict })
			.then(() => {
				refetch()
			})
			.catch((error) => {
				toast.error(error.data.message);
			});
	};
	const onDelete = (TasksId: string) => {
		delTask({TasksId})
			.then(() => {
				refetch()
			})
	};
	const Image = () => {
		if (item.typ === "INVAR") {
			return <img src={invarTaskLogo} />
		} else if (item.typ === "VAR") {
			return <img src={varTaskLogo} />
		} else {
			return null
		}

	}

	useEffect(() => {
		if (isError) {
			toast.error((error as any).data.message, {
				position: 'top-right',
			  });
		}
	  }, [isError]);
	return <>

		<Card
			style={{ width: 240 }}
			cover={<Image />}
		>
			<Meta title={item.name} />
			<p>Тип задачи: {item.typ === "INVAR" ? "Инвариантный" : "Вариативный"}</p>
			<Button style={{ width: "100%" }} type="primary" onClick={() => setModalOpen(true)}>
				Открыть
			</Button>

			{user === "ADMIN" ? 
			<>
				<br />
				<br />
				<Popconfirm
					title="Удаление"
					placement="bottom"
					onConfirm={() => onDelete(item.id)}
					description={<>
						<p>Вы точно хотите удалить эту задачу?</p>
					</>
					}
				>
					<Button style={{ width: "100%", color: "black" }} type="dashed">
						Удалить
					</Button>
				</Popconfirm> 
			</> : null}
		</Card>
		<Modal
			width={1024}
			title={item.name}
			centered
			open={modalOpen}
			footer={null}
			onCancel={() => setModalOpen(false)}
		>
			<Divider />
			<p>Тип задачи: {item.typ === "INVAR" ? "Инвариантный" : "Вариативный"}</p>
			<p>Описание задачи: <pre>{item.description}</pre></p>
			<p>Пользователи находящиеся в задаче:</p>
			<Table size='small' columns={columns} dataSource={item.users} rowKey="id" />
			<Row gutter={16} justify={"space-between"}>
				<Col flex="auto">
					<Popconfirm
						title="Последний шаг"
						placement="bottom"
						onConfirm={() => onClick(item.id)}
						description={<>
							<p>Пожалуйста введите кол-во процентов которое вы выполните от данной задачи!</p>
							<InputNumber
								value={predict}
								onChange={setPredict}
								min={0}
								max={100}
								formatter={(value) => `${value}%`}
							/>
						</>
						}
					>
						<Button style={{ width: "100%" }} type="primary" >
							Присоединится
						</Button>
					</Popconfirm>
				</Col>
				<Col flex="auto"></Col>
				<Col flex="auto" ><Link target="_blank" to={`http://31.129.96.5:5000/${item.fileName}`}><Button style={{ width: "100%" }} type="default" onClick={() => setModalOpen(true)}>
					Открыть карточку задачи
				</Button></Link></Col>
			</Row>
		</Modal>
	</>;
};
