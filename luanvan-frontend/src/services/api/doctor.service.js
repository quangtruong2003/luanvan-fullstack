import axios from 'axios';
import { API_BASE_URL } from '../config';

class DoctorService {
    async getAllDoctors() {
        try {
            const response = await axios.get(`${API_BASE_URL}/auth/doctors`);
            return response.data;
        } catch (error) {
            console.error('Error fetching doctors:', error);
            throw error;
        }
    }

    // Thêm các phương thức khác liên quan đến bác sĩ ở đây
    // Ví dụ: getDoctorById, getDoctorSchedule, etc.
}

export default new DoctorService(); 