import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import App from './App';
import Log from './Log';
import Purchase from './Purchase';

function PrivateRoute({ element, ...rest }) {
    const isAuthenticated = false; // Implement proper authentication logic here
    return (
        <Route
            {...rest}
            element={isAuthenticated ? element : <Navigate to="/App" replace />}
        />
    );
}

function MainRoutes() {
    return (
        <Routes>
            <Route path="/App" element={<App />} />
            <PrivateRoute path="/Log" element={<Log />} />
            <Route path="/purchase" element={<Purchase />} />
            <Route path='/Register' element={<Register />} /> 
            <Route path="/" element={<Navigate to="/App" replace />} />
        </Routes>
    );
}

export default MainRoutes;
