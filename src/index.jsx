import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom'
import { NotifProvider } from './Context/Notif.jsx';   
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
         <NotifProvider>
         <BrowserRouter>
        <App />
        </BrowserRouter>
        </NotifProvider>
  </React.StrictMode>
);

serviceWorkerRegistration.register();

