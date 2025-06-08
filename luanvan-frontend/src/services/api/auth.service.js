import axios from 'axios';
import { API_BASE_URL } from '../config';

class AuthService {
    async loginWithCredentials(credentials) {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    }

    async syncClerkUser(userData) {
        try {
            return await axios.post(`${API_BASE_URL}/auth/clerk-sync`, userData);
        } catch (error) {
            console.error('Error syncing user with Clerk:', error);
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return null;
            }

            const response = await axios.get(`${API_BASE_URL}/users/current`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    async logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('backendUserId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
    }
}

export default new AuthService(); 