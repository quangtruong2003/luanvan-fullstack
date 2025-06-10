import axios from 'axios';

export const API_BASE_URL = 'http://localhost:9090/api';

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Thêm interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Thêm interceptor để xử lý response
axiosInstance.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response) {
            // Token hết hạn hoặc không hợp lệ
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
            }
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 