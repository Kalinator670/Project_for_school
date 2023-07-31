import { Layout, Menu, theme } from 'antd';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { Suspense } from 'react';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { HeaderComponent } from './components/Header';
import { setUser } from './redux/features/userSlice';
import { useRefreshUserMutation } from './redux/api/authApi';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Profile from './pages/Profile/Profile';
const { Header, Content } = Layout;



const App: React.FC = () => {
  const navigate = useNavigate();
  const [refreshUser, { isLoading, isSuccess, isError, error }] = useRefreshUserMutation();
  const user = JSON.parse(localStorage.getItem('user') || "{}")
  React.useEffect(() => {
    if (user.token) {
      refreshUser({ token: user.token })
    } else {
      navigate("/")
    }
  }, [])

  React.useEffect(() => {

    if (isError) {
      navigate("/")
    }
  }, [isLoading]);

  const Tasks = React.lazy(() => import('./pages/Tasks/Tasks'));
  const Users = React.lazy(() => import('./pages/Users/Users'));
  const MyProjects = React.lazy(() => import('./pages/MyProjects/MyProjects'));
  const Projects = React.lazy(() => import('./pages/Projects/Projects'));
  const Statistics = React.lazy(() => import('./pages/Statistics/Statistics'));
  const RatingPage = React.lazy(() => import('./pages/Rating/RatingPage'));

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    console.log('dev')
  } else {
    console.log('prod')
  }

  React.useEffect(() => {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      console.log('dev')
    } else {
      console.log('prod')
    }
  }, []);

  return (
    <>
      <Layout style={{ height: '100%', overflow: 'scroll' }} className="layout">
        <HeaderComponent />
        <Layout>
          <Content style={{ padding: '20px 30px', display: "flex", justifyContent: "center" }}>
            <Routes>
              <Route path='/' element={<Suspense fallback={<div>Загрузка...</div>}><Login /></Suspense>} />
              <Route path="tasks/:taskType" element={<Suspense fallback={<div>Загрузка...</div>}><Tasks /></Suspense>} />
              <Route path="users" element={<Suspense fallback={<div>Загрузка...</div>}><Users /></Suspense>} />
              <Route path="my-projects" element={<Suspense fallback={<div>Загрузка...</div>}><MyProjects /></Suspense>} />
              <Route path="projects" element={<Suspense fallback={<div>Загрузка...</div>}><Projects /></Suspense>} />
              <Route path="profile" element={<Suspense fallback={<div>Загрузка...</div>}><Profile /></Suspense>} />
              <Route path="stat" element={<Suspense fallback={<div>Загрузка...</div>}><Statistics /></Suspense>} />
              <Route path="/rating/:taskId" element={<Suspense fallback={<div>Загрузка...</div>}><RatingPage /></Suspense>} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default App;
