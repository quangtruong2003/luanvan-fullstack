// API Base URL - cập nhật theo backend của bạn
const API_BASE_URL = 'http://localhost:9090/api';

// Helper function để thêm token vào headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function để xử lý response
const handleResponse = async (response) => {
  console.log('📡 Response:', response.url, response.status);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ API Error:', response.status, errorData);
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  console.log('✅ API Success:', response.url, data);
  return data;
};

// Auth Service
export const authService = {
  // Đăng nhập với email/password
  async loginWithCredentials(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Lấy thông tin user hiện tại
  async getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      // Kiểm tra response status trước khi parse JSON
      if (response.status === 401) {
        // Token hết hạn hoặc không hợp lệ
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('backendUserId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        throw new Error('Token expired or invalid');
      }

      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Get current user error:', error);
      // Nếu lỗi 401 hoặc token không hợp lệ, xóa token
      if (error.message.includes('401') || error.message.includes('Token') || error.message.includes('No token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('backendUserId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
      }
      return null; // Trả về null thay vì throw error để tránh crash app
    }
  },

  // Đăng xuất
  async logout() {
    try {
      // Xóa tất cả dữ liệu local
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('backendUserId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Tạo admin đầu tiên
  async createFirstAdmin(adminData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/create-first-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData)
      });

      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Create first admin error:', error);
      throw error;
    }
  },

  // Đồng bộ user với Clerk
  async syncClerkUser(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/clerk-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Sync Clerk user error:', error);
      throw error;
    }
  }
};

// Admin Service - Tách riêng để dễ quản lý
export const adminService = {
  // User Management
  async getAllUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  },

  async createUser(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/create-user`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  async updateUser(userId, userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  async deactivateUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/deactivate`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Deactivate user error:', error);
      throw error;
    }
  },

  async activateUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/activate`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Activate user error:', error);
      throw error;
    }
  },

  // Doctor Management
  async createDoctorProfile(userId, doctorData) {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors/user/${userId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(doctorData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Create doctor profile error:', error);
      throw error;
    }
  },

  async updateDoctor(doctorId, doctorData) {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(doctorData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Update doctor error:', error);
      throw error;
    }
  },

  async assignSpecialty(doctorId, specialtyId) {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/specialties/${specialtyId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Assign specialty error:', error);
      throw error;
    }
  },

  async deleteDoctor(doctorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Delete doctor error:', error);
      throw error;
    }
  },

  async deleteClinic(clinicId) {
    try {
      const response = await fetch(`${API_BASE_URL}/clinics/${clinicId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Delete clinic error:', error);
      throw error;
    }
  },

  async deleteSpecialty(specialtyId) {
    try {
      const response = await fetch(`${API_BASE_URL}/specialties/${specialtyId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Delete specialty error:', error);
      throw error;
    }
  },

  // Clinic Management
  async createClinic(clinicData) {
    try {
      const response = await fetch(`${API_BASE_URL}/clinics`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(clinicData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Create clinic error:', error);
      throw error;
    }
  },

  async updateClinic(clinicId, clinicData) {
    try {
      const response = await fetch(`${API_BASE_URL}/clinics/${clinicId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(clinicData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Update clinic error:', error);
      throw error;
    }
  },

  // Specialty Management
  async createSpecialty(specialtyData) {
    try {
      const response = await fetch(`${API_BASE_URL}/specialties`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(specialtyData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Create specialty error:', error);
      throw error;
    }
  },

  async updateSpecialty(specialtyId, specialtyData) {
    try {
      const response = await fetch(`${API_BASE_URL}/specialties/${specialtyId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(specialtyData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Update specialty error:', error);
      throw error;
    }
  },

  // Availability Slot Management
  async createAvailabilitySlot(slotData) {
    try {
      const response = await fetch(`${API_BASE_URL}/availability/slots`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(slotData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Create availability slot error:', error);
      throw error;
    }
  },

  async createBulkSlots(slotsData) {
    try {
      const response = await fetch(`${API_BASE_URL}/availability/slots/bulk`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(slotsData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Create bulk slots error:', error);
      throw error;
    }
  },

  // Appointment Management
  async getAllAppointments(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/appointments?${queryParams}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Get all appointments error:', error);
      throw error;
    }
  },

  async updateAppointmentStatus(appointmentId, statusData) {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(statusData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Update appointment status error:', error);
      throw error;
    }
  },

  // System Configuration
  async getSystemConfig() {
    try {
      const response = await fetch(`${API_BASE_URL}/system-config`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Get system config error:', error);
      throw error;
    }
  },

  async updateSystemConfig(configData) {
    try {
      const response = await fetch(`${API_BASE_URL}/system-config`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(configData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Update system config error:', error);
      throw error;
    }
  },

  // Dashboard Statistics
  async getDashboardStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  // Get today's appointments
  async getTodayAppointments() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_BASE_URL}/appointments?date=${today}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Get today appointments error:', error);
      throw error;
    }
  }
};

// API Service cho các endpoint khác
export const apiService = {
  // Doctors
  async getDoctors(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/doctors?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get doctors error:', error);
      throw error;
    }
  },

  async getDoctorById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get doctor by id error:', error);
      throw error;
    }
  },

  // Specialties
  async getSpecialties(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/specialties?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get specialties error:', error);
      throw error;
    }
  },

  // Appointments
  async getMyAppointments() {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/patient/me`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get my appointments error:', error);
      throw error;
    }
  },

  async createAppointment(appointmentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(appointmentData)
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Create appointment error:', error);
      throw error;
    }
  },

  // Clinics
  async getClinics(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/clinics?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get clinics error:', error);
      throw error;
    }
  }
};

// Doctor-specific API Services
export const doctorService = {
  async getMySchedule(params = {}) {
    try {
      const userId = localStorage.getItem('backendUserId');
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/availability/slots/doctor/${userId}?${queryParams}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Get my schedule error:', error);
      throw error;
    }
  },

  async getMyAppointments(params = {}) {
    try {
      const userId = localStorage.getItem('backendUserId');
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/appointments/doctor/${userId}?${queryParams}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Get doctor appointments error:', error);
      throw error;
    }
  },

  async updateMyProfile(profileData) {
    try {
      // Get doctor ID first
      const userId = localStorage.getItem('backendUserId');
      const doctorResponse = await fetch(`${API_BASE_URL}/doctors/user/${userId}`, {
        headers: getAuthHeaders()
      });
      const doctor = await handleResponse(doctorResponse);
      
      const response = await fetch(`${API_BASE_URL}/doctors/${doctor.doctorId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Update doctor profile error:', error);
      throw error;
    }
  }
};

export default { authService, apiService, adminService, doctorService }; 