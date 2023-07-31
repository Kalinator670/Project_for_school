import { Button, Col, FloatButton, Form, Input, InputNumber, Modal, Pagination, PaginationProps, Row, notification } from "antd";
import { Item } from "../../components/Item";
import { useCreateProjectMutation, useGetAllProjectsQuery, useGetAllUserProjectsQuery } from "../../redux/api/projectsApi";
import { PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from "react";
import TextArea from "antd/es/input/TextArea";
import { NotificationPlacement } from "antd/es/notification/interface";
import { toast } from "react-toastify";




const MyProjects = () => {

	const [modalOpen, setModalOpen] = useState(false);
	const [current, setCurrent] = useState(1);
	
	const [form] = Form.useForm();
	const [api, contextHolder] = notification.useNotification();
	const { data, isSuccess, refetch, isError, error  } = useGetAllUserProjectsQuery({ limit: '8', page: `${current}` })
	const onChange = (page) => {
		setCurrent(page);
		refetch()
	};

	React.useEffect(()=>{
		if (isError) {
		 toast.error((error as any).data.message)
		}
	},[isError])
	return <div style={{ maxWidth: 1024}}>
		<Row justify="space-around" style={{ width: "100%" }} gutter={[16, 16]}>
			{isSuccess ?
				data.rows.map((item) => {
					return (
						<Col style={{ width: "320px" }} key={item.name}  xs={{span: 16}} sm={{span: 12}} md={{span: 8}} lg={{span: 6}} xl={{span: 6}} >
							<Item userProject={true} key={item.id} item={item} refetch={refetch} />
						</Col>
					);
				}) :
				null
			}
		</Row>
		<Row justify="center" style={{marginTop: "8px"}}>
		<Pagination defaultPageSize={8} pageSize={8} showSizeChanger={false} current={current} onChange={onChange} total={isSuccess ? data.count : 0} />
		</Row>
		
	</div>;
};
export default MyProjects;