import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import App from './App';
import Log from './Log';
import Purchase from './Purchase';
import Login from './Login';
import Register from './Register';
import Loader from './Loader';
import UserAccount from './UserAccount';
import Pchange from './Pchange';
import Paymentmethod from './Paymentmethod';

function MainRoutes() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let loadingTimeout;

    const handleRouteChange = () => {
      setIsLoading(true);
      loadingTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 2000); // Adjust the delay as needed
    };

    window.addEventListener('locationchange', handleRouteChange);

    // Clean up the event listener and timeout when the component unmounts
    return () => {
      window.removeEventListener('locationchange', handleRouteChange);
      clearTimeout(loadingTimeout);
    };
  }, []);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <Routes>
          <Route path="/App" element={<App />} />
          <Route path="/Log" element={<Log />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pchange" element={<Pchange />} />
          <Route path="/" element={<Navigate to="/App" replace />} />
          <Route path="/user-account" element={<UserAccount />} />
          <Route path='/Paymentmethod' element={<Paymentmethod/>}/>
        </Routes>
      )}
    </>
  );
}

export default MainRoutes;