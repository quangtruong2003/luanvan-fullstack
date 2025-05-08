import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import './App.css';

// Thêm route guard để kiểm tra đăng nhập
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Thêm route cho các trang khác ở đây */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <div>Trang Dashboard (cần tạo component)</div>
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <div>Trang Profile (cần tạo component)</div>
          </PrivateRoute>
        } />
        <Route path="/login" element={<div>Trang Login (cần tạo component)</div>} />
        <Route path="*" element={<div>Không tìm thấy trang</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
