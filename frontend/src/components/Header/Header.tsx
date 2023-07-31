import { Menu, Layout, theme, Row, Col } from 'antd'
import { Link } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { useAppSelector } from '../../redux/hooks';
import { useState } from 'react';
import { MenuComponent } from '../Menu';
const { Header } = Layout;



export const HeaderComponent = () => {
	const {
		token: { colorBgContainer },
	} = theme.useToken();
	const user = useAppSelector((state) => state.userState.user);

	return (
		<>
			{user ? <Header style={{backgroundColor: colorBgContainer}}>
				<Row justify="center">
				
  				<Col  flex="none" >
				  <MenuComponent/>
				</Col>
				
				
				</Row>
			</Header> : ''}
		</>
	)
};
