import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import './index.css';
import { ConfigProvider, theme } from 'antd';
import { BrowserRouter } from "react-router-dom";
import { store } from './redux/store';
import { customizeRenderEmpty } from './components/customizeRenderEmpty';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
    <Provider store={store}>
      <BrowserRouter>
        <ConfigProvider
          renderEmpty={customizeRenderEmpty}
          theme={{
            algorithm: theme.defaultAlgorithm,
          }}
        >
          <App />
        </ConfigProvider>
      </BrowserRouter>
    </Provider>
);


