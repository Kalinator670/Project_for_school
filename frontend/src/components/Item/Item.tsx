import avatar from "../../assets/Avatar.png";
import { Avatar, Button, Card, Col, Divider, Form, Input, InputNumber, List, Modal, Popconfirm, Row, Upload, UploadFile, UploadProps, message, notification } from 'antd';
import { ProjectTwoTone, UploadOutlined, UserOutlined } from '@ant-design/icons';
import mainProjectLogo from '../../assets/Проект.png';
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useAddRateMutation, useAddUserMutation, useDeleteProjMutation, useDeleteUserProjMutation, useEditProjectMutation } from "../../redux/api/projectsApi";
import { toast } from "react-toastify";
import { useAppSelector } from "../../redux/hooks";
import { selectUser } from "../../redux/features/userSlice";
import TextArea from "antd/es/input/TextArea";
const { Meta } = Card;

export const Item = ({userProject, item, refetch }) => {
	const { user } = useAppSelector(selectUser);
	const [addUser, { isError: isErrorUser, error: errorUser }] = useAddUserMutation();
	const [addRate, { isError: isErrorRate, error: errorRate }] = useAddRateMutation();
	const [editProject, { isError, error }] = useEditProjectMutation();
	const [api, contextHolder] = notification.useNotification();
	const [delProj] = useDeleteProjMutation();
	const [delUserProj] = useDeleteUserProjMutation();
	const [rate, setRate] = useState< string | number | null>(100);
	const [modalOpen, setModalOpen] = useState(false);
	const [editorModalOpen, setEditorModalOpen] = useState(false);
	const [fileList, setFileList] = useState<UploadFile[]>([
		{
			uid: '0',
			name: `${item.fileName}`,
			status: 'done',
			url: `http://31.129.96.5:5000/${item.fileName}`,
			thumbUrl: `http://31.129.96.5:5000/${item.fileName}`,
		  },
	]);
	const [form] = Form.useForm();
	const onClick = (contentId: string) => {
		addUser({contentId})
		.then(()=>{
			refetch()
		})
	};

	const onRateClick = (contestId: string) => {
		addRate({ contestId, rate })
		.then(()=>{
			refetch()
		})
	};
	const onDelete = (id: string) => {
		delProj({id})
			.then(() => {
				refetch()
			})
	};
	const onUserDelete = (userId: number) => {
		delUserProj({userId: userId, contestsId: item.id})
			.then(() => {
				refetch()
			})
	};
	useEffect(() => {
		if (isErrorUser) {
			toast.error((errorUser as any).data.message, {
				position: 'top-right',
			  });
		
		}

	  }, [isErrorUser]);
	  useEffect(() => {
		if (isErrorRate) {
			toast.error((errorRate as any).data.message, {
				position: 'top-right',
			  });
		
		}

	  }, [isErrorRate]);
	  if (!user) {
		return null;
	}

const DeleteUserButton = (id) => {
	return (<>
		{user.role === "ADMIN" && userProject === false ? 
			
				<Popconfirm
					key={id.id}
					title="Удаление"
					placement="bottom"
					onConfirm={() => onUserDelete(id.id)}
					description={<>
						<p>Вы точно хотите удалить этого пользователя?</p>
					</>
					}
				>
					<Button type="link" >Удалить</Button>
				</Popconfirm> 
			 : null}
			</>
	)
}

const onFinishModal = (values: any) => {
	const formData = new FormData();
	formData.append("f", fileList[0]?.originFileObj);
	formData.append("id", item.id);
	formData.append("name", values.name);
	formData.append("description", values.description);
	formData.append("workers", values.workers);

	
	editProject(formData)
	  .then(() => {
		setEditorModalOpen(false);
		refetch();
	  })
	  .catch((error) => {
		toast.error(error.data.message);
	  });
  };

const props: UploadProps = {
	beforeUpload: (file) => {
	  const isAllowType = file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'application/msword' || file.type === 'text/plain' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'application/pdf' ;
	  const isLt200M = file.size / 1024 / 1024 < 1;
	  if (!isAllowType) {
		message.error(`Этот загрузчик поддерживает только: .png, .jpeg, .doc, .docx, .pdf форматы! `);
		return Upload.LIST_IGNORE;
	  }
	  if (!isLt200M) {
		message.error(`Размер файла не может превышать 200 мегабайт`);
		return Upload.LIST_IGNORE;
	  }
	  return false;
	},
  };

const normFile = (e) => {
	if (Array.isArray(e)) {
		return e.slice(-1);
	}
	return e && e.fileList.slice(-1);
};

const EditProjButton = () => {
	return (<>
		{userProject=== true ? <>
			<Button style={{ width: "100%" }} type="primary" onClick={() => setEditorModalOpen(true)}>Редактировать</Button>
			</> : null}
			</>
	)
}


	return <>

		<Card
			style={{ width: 240 }}
			cover={<img src={mainProjectLogo}/>}
		>
			<Meta title={item.name} />
			Автор: {item.users[0]?.name}<br />
			Квота: {item.users?.length}/{item.workers}<br />
			<p>Оценка экспертов: {item.rating.rating == 0 ? "Нет" : item.rating.rating}</p>
			<Button style={{ width: "100%" }} type="primary" onClick={() => setModalOpen(true)}>
				Открыть
			</Button>{user.role === "ADMIN" && userProject === false ? 
			<>
				<br />
				<br />
				<Popconfirm
					title="Удаление"
					placement="bottom"
					onConfirm={() => onDelete(item.id)}
					description={<>
						<p>Вы точно хотите удалить этот проект?</p>
					</>
					}
				>
					<Button style={{ width: "100%", color: "black" }} type="dashed">
						Удалить
					</Button>
				</Popconfirm> 
			</> : null}
			<br/>
			<br/>
			<EditProjButton/>
		</Card>
		<Modal
			width={1024}
			title="Редактирование проекта"
			centered
			open={editorModalOpen}
			footer={null}
			onCancel={() => setEditorModalOpen(false)}
		>

			<Form
				form={form}
				layout="vertical"
				onFinish={onFinishModal}
			>
				<Form.Item initialValue={item.name} label="Название проекта:" name="name" rules={[{ required: true, message: 'Пожалуйста заполните поле!' }]} >
					<Input />
				</Form.Item>
				<Form.Item initialValue={item.workers} label="Квота:" name="workers" rules={[{ required: true, message: 'Пожалуйста заполните поле!' }]} >
					<InputNumber
						min={1}
						max={100}
						formatter={(value) => `0/${value}`}
					/>
				</Form.Item>
				
				<Form.Item
					label="Описание проекта:"
					name="description"
					rules={[{ required: true, message: 'Пожалуйста заполните поле!' }]}
					initialValue={item.description}
				>
					<TextArea
						autoSize={{ minRows: 4, maxRows: 8 }}
						maxLength={2000}
						showCount
					/>
				</Form.Item>
				<Form.Item name="file"
					valuePropName="file"
					getValueFromEvent={normFile}
					label="Карточка проекта" rules={[{ required: true, message: 'Пожалуйста заполните поле!' }]} >
					<Upload {...props}  maxCount={1} fileList={fileList} onChange={({ fileList }) => setFileList(fileList)}>
						<Button icon={<UploadOutlined />}>Загрузить карточку проекта</Button>
					</Upload>
				</Form.Item>
				<Form.Item>
					<Button htmlType="submit" type="primary">Редактировать</Button>
				</Form.Item>
			</Form>
		</Modal>
		<Modal
			width={1024}
			title={item.name}
			centered
			open={modalOpen}
			footer={null}
			onCancel={() => setModalOpen(false)}
		>
			<Divider />
			<p>Автор проекта: {item.users[0]?.name}</p>
			<p>Квота людей: {item.users?.length}/{item.workers}</p>
			<p>Средняя оценка экспертов: {item.rating.rating == 0 ? "Нет" : item.rating.rating}</p>
			<p>Описание проекта: <pre>{item.description}</pre></p>
			<p>Пользователи находящиеся в проекте:</p>
			<List
        dataSource={item?.users}
        renderItem={(item: {id: number, name: string, email: string}, index) => (
          <List.Item
		  actions={[<DeleteUserButton id={item.id}/>]}
		  >
			<List.Item.Meta
              avatar={
                <Avatar shape="square" icon={<UserOutlined />} />
              }
              title={item.name}
              description={item.email}
            />
          </List.Item>
        )}
      />
			<Row gutter={16} justify={"space-between"}>
				<Col flex="auto">
				{item.users.length >= item.workers ? <Button style={{ width: "100%" }} disabled type="primary"  onClick={() => onClick(item.id)}>
					Присоединится
				</Button> : <Button style={{ width: "100%" }} type="primary"  onClick={() => onClick(item.id)}>
					Присоединится
				</Button>}
					</Col>
				<Col flex="auto">
				{user.role == 'EXPERT' && userProject == false || user.role == 'ADMIN' && userProject == false ? <Popconfirm
						title="Последний шаг"
						placement="bottom"
						onConfirm={()=> onRateClick(item.id)}
						description={<>
						<p>Пожалуйста оцените проект!</p>
							<InputNumber
								value={rate}
								onChange={setRate}
								min={0}
								max={100}
								formatter={(value) => `${value}`}
							/>
						</> 
						}
					>
						<Button style={{ width: "100%" }} type="primary" >
							Оценить проект
						</Button>
					</Popconfirm> : null}
				</Col>
				<Col flex="auto" >
					<Link target="_blank" to={`http://31.129.96.5:5000/${item.fileName}`}><Button style={{ width: "100%" }} type="default" onClick={() => setModalOpen(true)}>
					Открыть карточку проекта
				</Button></Link>
					</Col>
			</Row>
		</Modal>
	</>;
};
