import { Button, Col, DatePicker, FloatButton, Form, Input, InputNumber, Modal, Pagination, PaginationProps, Row, Select, Upload, UploadProps, message, notification } from "antd";
import { TaskItem } from "../../components/TaskItem";
import { useCreateTaskMutation, useGetAllTasksQuery } from "../../redux/api/taskApi";
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from "react";
import TextArea from "antd/es/input/TextArea";
import { NotificationPlacement } from "antd/es/notification/interface";
import { toast } from "react-toastify";
import { useAppSelector } from "../../redux/hooks";
import { selectUser } from "../../redux/features/userSlice";
import { useParams } from "react-router-dom";



const Tasks = () => {
	const { taskType } = useParams();
	const { user } = useAppSelector(selectUser);
	const [modalOpen, setModalOpen] = useState(false);
	const [current, setCurrent] = useState(1);
	const [form] = Form.useForm();
	const [fileList, setFileList] = useState([]);
	const [api, contextHolder] = notification.useNotification();
	const { data, isSuccess, refetch } = useGetAllTasksQuery({ limit: '8', page: `${current}`, type: taskType })
	const [createProject, { isSuccess: isCreateSuccess, isError, error }] = useCreateTaskMutation();
	const onChange = (page) => {
		setCurrent(page);
		refetch()
	};
	const onFinishModal = (values: any) => {

		const formData = new FormData();
		const date = (new Date(values.stop, 4, 31)).toUTCString();
		formData.append("f", fileList[0]?.originFileObj);
		formData.append("name", values.name);
		formData.append("description", values.description);
		formData.append("typ", values.typ);
		formData.append("stop", date);

		createProject(formData)
			.then(() => {
				setModalOpen(false);
				refetch();
			})
			.catch((error) => {
				toast.error(error.data.message);
			});
	};

	React.useEffect(() => {
		if (isError) {
			toast.error((error as any).data.message)
		}
		if (isCreateSuccess) {
			refetch()
		}
	}, [isError, isCreateSuccess])

	const props: UploadProps = {
		beforeUpload: (file) => {
			const isAllowType = file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'application/msword' || file.type === 'text/plain' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'application/pdf';
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
	if (!user) {
		return null
	}

	return <div style={{ maxWidth: 1024 }}>
		<Row justify="space-around" style={{ width: "100%" }} gutter={[16, 16]}>
			{isSuccess ?
				data.rows.map((item) => {
					return (
						<Col style={{ width: "320px" }} key={item.name} xs={{ span: 16 }} sm={{ span: 12 }} md={{ span: 8 }} lg={{ span: 6 }} xl={{ span: 6 }} >
							<TaskItem key={item.id} user={user.role} item={item} refetch={refetch} />
						</Col>
					);
				}) :
				null}

			{user.role === "ADMIN" ? <FloatButton
				icon={<PlusOutlined />}
				shape="circle"
				tooltip={<div>Создать задачу</div>}
				onClick={() => setModalOpen(true)}
			/> : null}
			<Modal
				width={1024}
				title="Создание задачи"
				centered
				open={modalOpen}
				footer={null}
				onCancel={() => setModalOpen(false)}
			>

				<Form
					form={form}
					layout="vertical"
					onFinish={onFinishModal}
				>
					<Form.Item label="Название задачи:" name="name" rules={[{ required: true, message: 'Пожалуйста заполните поле!' }]} >
						<Input />
					</Form.Item>

					<Form.Item label="Год окончания задачи:" name="stop" rules={[{ required: true, message: 'Пожалуйста заполните поле!' }]} >
						<InputNumber
							defaultValue={2024}
							min={2024}
							max={2099}
						/>
					</Form.Item>

					<Form.Item label="Тип задачи:" name="typ" rules={[{ required: true, message: 'Пожалуйста заполните поле!' }]} >
						<Select
							defaultValue="VAR"
							options={[
								{ value: 'INVAR', label: 'Инвариантная задача' },
								{ value: 'VAR', label: 'Вариативная задача' },
							]}
						/>
					</Form.Item>

					<Form.Item
						label="Описание задачи:"
						name="description"
						rules={[{ required: true, message: 'Пожалуйста заполните поле!' }]}
					>
						<TextArea
							maxLength={2000}
							showCount
							autoSize={{ minRows: 4, maxRows: 8 }}
						/>
					</Form.Item>
					<Form.Item name="file"
						valuePropName="file"
						getValueFromEvent={normFile}
						label="Карточка задачи" rules={[{ required: true, message: 'Пожалуйста заполните поле!' }]} >
						<Upload {...props} maxCount={1} fileList={fileList} onChange={({ fileList }) => setFileList(fileList)}>
							<Button icon={<UploadOutlined />}>Загрузить карточку задачи</Button>
						</Upload>
					</Form.Item>
					<Form.Item>
						<Button htmlType="submit" type="primary">Создать</Button>
					</Form.Item>
				</Form>
			</Modal>
		</Row>
		<Row justify="center" style={{ marginTop: "8px" }}>
			<Pagination defaultPageSize={8} pageSize={8} showSizeChanger={false} current={current} onChange={onChange} total={isSuccess ? data.count : 0} />
		</Row>

	</div>;
};
export default Tasks;