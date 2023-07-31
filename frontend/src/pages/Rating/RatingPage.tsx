import React from 'react';
import { useParams } from 'react-router-dom';
import RatingTable from '../../components/RatingTable/RatingTable';
import { Spin } from 'antd';
import { useGetOneQuery } from '../../redux/api/taskApi';

const RatingPage = () => {
  const { taskId } = useParams();
  const { data, isFetching } = useGetOneQuery({taskId});

  if (isFetching) {
    return <Spin />;
  }

  return (
    <div>
      <h1>{data.name}</h1>
      <p>Тип задачи: {data.typ}</p>
			<p>Время закрытия задачи: {data.stop}</p>
			<pre>Описание задачи: {data.description }</pre>
			<p>Пользователи находящиеся в задаче:</p>
      <RatingTable data={data} />
    </div>
  );
};
export default RatingPage;