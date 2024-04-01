import './assets/main.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import HomeView from './routes/home-view';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import NewAssetView from './routes/new-asset-view';
import UpdateAssetView from './routes/update-asset-view';

const router = createHashRouter([
  {
    path: '/',
    element: <HomeView />,
    children: [
      {
        path: 'new-asset',
        element: <NewAssetView />,
      },
      {
        path: 'update-asset',
        element: <UpdateAssetView />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
