import axios from 'axios';

// Tạo instance axios với cấu hình mặc định
const API = axios.create({
  baseURL: 'http://localhost:8080/api', // Base URL của Spring Boot API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để xử lý token authentication
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý response và lỗi
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi 401 Unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;