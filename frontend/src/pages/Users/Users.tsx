import React, { FC, useState } from 'react';
import { Button, FloatButton, Form, Input, Modal, Pagination, Select, Space, Table, TableColumnsType } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useDeleteUserMutation, useGetAllUsersQuery, useUpdateUserMutation } from '../../redux/api/userApi';
import { PlusOutlined, DeleteOutlined} from '@ant-design/icons';
import Register from '../Register/Register';
import { useDeleteAllTaskMutation } from '../../redux/api/taskApi';

const Users: FC = (props) => {

	interface DataType {
		Tasks: readonly DataType[];
		id: number;
		name: string;
		email: string;
		role: string;
	}

	const columns: ColumnsType<DataType> = [
		{
			title: 'ФИО',
			dataIndex: 'name',
			key: 'name',
			render: (text, record) => <Input defaultValue={text} onChange={(e) => handleInputChange(e.target.value, record.id, 'name')} />,
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			render: (text, record) => <Input defaultValue={text} onChange={(e) => handleInputChange(e.target.value, record.id, 'email')} />,
		},
		{
			title: 'Роль',
			dataIndex: 'role',
			key: 'role',
			render: (item, record) => <Select
				defaultValue={`${item}`}
				onChange={(value) => handleSelectChange(value, record.id)}
				style={{ width: 120 }}
				options={[
					{ value: 'USER', label: 'Юзер' },
					{ value: 'EXPERT', label: 'Эксперт' },
					{ value: 'ADMIN', label: 'Админ' },
				]}
			/>,
		},
		{
			title: 'Действия',
			key: 'operation',
			fixed: 'right',
			width: 100,
			render: (record) => <Space size="middle">
				<Button type='dashed' onClick={() => handleApplyChanges(record.id)}>Применить изменения</Button>
				<Button type='default' onClick={() => handleDeleteChanges(record.id)}>Удалить</Button>
			</Space>,
		},
	];

	const expandedColumns: TableColumnsType<any> = [
		{ title: 'Имя задачи', dataIndex: 'name', key: 'name' },
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
			render: (item) => item.rate.rating === 0 ? <p>Нету</p> : item.rate.rating,
		},
	];
	const [modalOpen, setModalOpen] = useState(false);
	const [current, setCurrent] = useState(1);
	const [editedData, setEditedData] = useState({});
	const { data, isSuccess, refetch } = useGetAllUsersQuery({ limit: '8', page: `${current}` });
	const [updateUser] = useUpdateUserMutation();
	const [deleteUser] = useDeleteUserMutation();
	const [deleteTask] = useDeleteAllTaskMutation();
	
	const handleInputChange = (value, id, key) => {
		setEditedData((prev) => ({
			...prev,
			[id]: {
				...prev[id],
				[key]: value,
			},
		}));
	};

	const handleSelectChange = (value, id) => {
		setEditedData((prev) => ({
			...prev,
			[id]: {
				...prev[id],
				role: value,
			},
		}));
	};

	const handleApplyChanges = (id) => {

		const { name, email, role } = editedData[id];
		updateUser({ id, name, email, role })
			.then(() => {
				setEditedData({});
				refetch();
			})
	};

	const handleDeleteChanges = (id) => {
		deleteUser({ id })
			.then(() => {
				refetch();
			})
	};

	const onChange = (page) => {
		setCurrent(page);
		refetch();
	};
	const onFinishModal = () => {
		setModalOpen(false);
		refetch();
	};
	React.useEffect(() => {
		if (isSuccess) {
			refetch()
		}
	}, [isSuccess])

	return (
		<div style={{ width: "100%", maxWidth: "1024px", height: "86vh", padding: "32px 32px", background: "#FFFFFF", borderRadius: "32px", boxShadow: "28px 0px 50.4863px rgba(0, 0, 0, 0.17)", justifyContent: "center", }}>
			{isSuccess ?
				<>
					<Table size='middle' scroll={{ y: 500, x: 'max-content' }} pagination={false} expandable={{ expandedRowRender: (record) => <Table columns={expandedColumns} dataSource={record.Tasks} pagination={false} />, defaultExpandedRowKeys: ['0'] }} columns={columns} dataSource={data.rows} rowKey="id" />
					<Pagination defaultPageSize={8} pageSize={8} showSizeChanger={false} current={current} onChange={onChange} total={isSuccess ? data.count : 0} />
				</>
				:
				null}
			<FloatButton.Group>
			<FloatButton
				icon={<PlusOutlined />}
				shape="circle"
				tooltip={<div>Добавить пользователя</div>}
				onClick={() => setModalOpen(true)}
			/>
			<FloatButton
				icon={<DeleteOutlined />}
				shape="circle"
				tooltip={<div>Удалить задачи</div>}
				onClick={deleteTask}
			/>	
			</FloatButton.Group>
			
			<Modal
				width={1024}
				title="Добавить пользователя"
				centered
				open={modalOpen}
				footer={null}
				onCancel={() => setModalOpen(false)}
			>
				<Register modal={onFinishModal}/>
			</Modal>
		</div>
	)
};
export default Users;
