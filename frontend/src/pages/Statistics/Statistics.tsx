import { Radar } from '@ant-design/charts';
import { FC } from 'react';
import { useGetStatTasksQuery } from '../../redux/api/taskApi';
import { Col, Row, Tabs } from 'antd';

const Statistics = () => {
	const { data: dataStatVar, isSuccess: isSuccessStatVar, refetch: refetchStatVar } = useGetStatTasksQuery({ type: 'VAR', name: 'ПЛАН'})
	const { data: dataStatVarF, isSuccess: isSuccessStatVarF, refetch: refetchStatVarF } = useGetStatTasksQuery({ type: 'VAR', name: 'ФАКТ'})
	const { data: dataStatInvar, isSuccess: isSuccessStatInvar, refetch: refetchStatInvar } = useGetStatTasksQuery({ type: 'INVAR', name: 'ПЛАН'})
	const { data: dataStatInvarF, isSuccess: isSuccessStatInvarF, refetch: refetchStatInvarF } = useGetStatTasksQuery({ type: 'INVAR', name: 'ФАКТ'})

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

	  const configF = {
		data: dataStatVarF,
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
	
	  const configI = {
		data: dataStatInvar,
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

	  const configIF = {
		data: dataStatInvarF,
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
	return <div style={{ width: "100%", maxWidth: "1024px", height: "100%", padding: "32px 32px", background: "#FFFFFF", borderRadius: "32px", boxShadow: "28px 0px 50.4863px rgba(0, 0, 0, 0.17)", justifyContent: "center",  }} >
		<Tabs
			defaultActiveKey="1"
			items={[
				{
					label: 'Вариативная статистика',
					key: '1',
					children: <>{isSuccessStatVar && isSuccessStatVarF && dataStatVar.length >= 3 ? <><Row justify="center"> <Col span={24} ><Radar {...config} /></Col></Row> <Row justify="center" ><Col span={24} ><Radar  {...configF} /></Col></Row></> : 'Добавьте больше задач чтобы видеть статистику'}</>,
				},
				{
					label: 'Инвариантная статистика',
					key: '2',
					children: <>{isSuccessStatInvar && isSuccessStatInvarF && dataStatInvar.length >= 3 ? <><Row justify="center"> <Col span={24} ><Radar {...configI} /></Col></Row> <Row justify="center" ><Col span={24} ><Radar  {...configIF} /></Col></Row></> : 'Добавьте больше задач чтобы видеть статистику'}</>,
				},
			]}
		/>
	</div>;
};
export default Statistics;
