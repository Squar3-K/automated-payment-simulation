// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Log from './Log';
import Purchase from './Purchase';
import Login from './Login';
import Register from './Register';
import reportWebVitals from './reportWebVitals';
import UserAccount from './UserAccount';
import Pchange from './Pchange';
import Paymentmethod from './Paymentmethod'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/App" element={<App />} />
        <Route path="/Log" element={<Log />} />
        <Route path="/purchase" element={<Purchase />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user-account" element={<UserAccount />} />
        <Route path="/pchange" element={<Pchange />} />
        <Route path="/" element={<App />} />
        <Route path='/Paymentmethod' element={<Paymentmethod/>}/>
      </Routes>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();