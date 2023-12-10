import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AnonAadhaarProvider } from 'anon-aadhaar-react';
const app_id = process.env.REACT_APP_ID || '';
console.log(app_id);
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  // <React.StrictMode>
  <AnonAadhaarProvider _appId={app_id} _testing={false}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AnonAadhaarProvider>
  // </React.StrictMode>
);
