// API Base URL - sử dụng environment variable hoặc detect production
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:9090/api' 
    : 'https://luanvan-backend-1g56.onrender.com/api');

// Notification service for user feedback
export const notificationService = {
  // Show success notification
  showSuccess: (message) => {
    console.log('✅ Success:', message);
    // Can be integrated with toast library like react-hot-toast
    if (window.showNotification) {
      window.showNotification(message, 'success');
    }
  },

  // Show error notification
  showError: (message) => {
    console.error('❌ Error:', message);
    // Can be integrated with toast library like react-hot-toast
    if (window.showNotification) {
      window.showNotification(message, 'error');
    }
  },

  // Show warning notification
  showWarning: (message) => {
    console.warn('⚠️ Warning:', message);
    // Can be integrated with toast library like react-hot-toast
    if (window.showNotification) {
      window.showNotification(message, 'warning');
    }
  },

  // Show info notification
  showInfo: (message) => {
    console.info('ℹ️ Info:', message);
    // Can be integrated with toast library like react-hot-toast
    if (window.showNotification) {
      window.showNotification(message, 'info');
    }
  }
};

// Helper function để thêm token vào headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log(token);
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function for public API requests (không cần token)
const getPublicHeaders = () => {
  return {
    'Content-Type': 'application/json'
  };
};

// Enhanced error handling with user-friendly messages
const handleApiError = (error, operation) => {
  const errorMessages = {
    SLOT_CONFLICT: 'Có xung đột lịch làm việc giữa các chuyên khoa',
    INVALID_TIME_RANGE: 'Khung thời gian không hợp lệ',
    NO_WORK_SHIFTS: 'Chưa có ca làm việc được cấu hình cho chuyên khoa này',
    SLOT_ALREADY_BOOKED: 'Slot này đã có bệnh nhân đặt lịch',
    SLOT_GENERATION_FAILED: 'Không thể tạo slots tự động',
    CONFLICT_RESOLUTION_FAILED: 'Không thể giải quyết xung đột lịch',
    BATCH_OPERATION_FAILED: 'Thao tác hàng loạt thất bại',
    SPECIALTY_NOT_FOUND: 'Không tìm thấy chuyên khoa',
    DOCTOR_NOT_FOUND: 'Không tìm thấy thông tin bác sĩ',
    UNAUTHORIZED_ACCESS: 'Không có quyền truy cập',
    NETWORK_ERROR: 'Lỗi kết nối mạng',
    SERVER_ERROR: 'Lỗi server, vui lòng thử lại sau'
  };
  
  const message = errorMessages[error.code] || error.message || 'Có lỗi xảy ra';
  
  // Log error for debugging
  console.error(`🔥 API Error [${operation}]:`, error);
  
  // Show notification to user
  notificationService.showError(message);
  
  // Return user-friendly error with details
  return {
    message,
    code: error.code,
    operation,
    timestamp: new Date().toISOString()
  };
};

// Helper function để xử lý authentication errors
const handleAuthError = (error, response) => {
  if (response && (response.status === 401 || response.status === 403)) {
    console.warn('🔒 Authentication error - clearing tokens');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('backendUserId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    // Vô hiệu hóa chuyển hướng cứng để Clerk xử lý
    // setTimeout(() => {
    //   window.location.href = '/login';
    // }, 1000);
    
    throw new Error('Session expired. Please login again.');
  }
  return error;
};

// Helper function để xử lý response
const handleResponse = async (response) => {
  console.log('📡 Response:', response.url, response.status);
  
  if (!response.ok) {
    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      console.warn('🔒 Authentication error detected');
      handleAuthError(null, response);
    }
    
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ API Error:', response.status, errorData);
    
    // Create descriptive error message
    const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
    error.response = {
      status: response.status,
      data: errorData
    };
    throw error;
  }

  // Check if response has content and is JSON
  const contentType = response.headers.get('content-type');
  const hasContent = response.headers.get('content-length') !== '0';
  
  if (hasContent && contentType && contentType.includes('application/json')) {
    try {
      const data = await response.json();
      console.log('✅ API Success (JSON):', response.url, data);
      return data;
    } catch (error) {
      console.warn('⚠️ Failed to parse JSON, trying text:', error);
      const text = await response.text();
      console.log('✅ API Success (Text):', response.url, text);
      return { message: text, success: true };
    }
  } else {
    // For responses without JSON content (like PUT requests)
    const text = await response.text();
    console.log('✅ API Success (Text):', response.url, text);
    return { message: text || 'Operation completed successfully', success: true };
  }
};

// Simple fetch wrapper
const apiRequest = async (url, options = {}) => {
  try {
    console.log('🚀 API Request:', url, options.method || 'GET');
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// Public API request (không cần authentication)
const publicApiRequest = async (url, options = {}) => {
  try {
    console.log('🚀 Public API Request:', url, options.method || 'GET');
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getPublicHeaders(),
        ...options.headers
      }
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Public API Request failed:', error);
    throw error;
  }
};

// Debug helper functions - expose to window for testing
if (typeof window !== 'undefined') {
  window.testApiService = {
    async testWorkShifts(clinicId) {
      console.log('🧪 Testing work shifts API for clinic:', clinicId);
      try {
        const url = `${API_BASE_URL}/standard-work-shifts/clinic/${clinicId}`;
        console.log('🧪 Testing URL:', url);
        const result = await apiRequest(url);
        console.log('🧪 Test result:', result);
        return result;
      } catch (error) {
        console.error('🧪 Test failed:', error);
        throw error;
      }
    },
    async testDoctorInfo(doctorId) {
      console.log('🧪 Testing doctor info API for doctor:', doctorId);
      try {
        const url = `${API_BASE_URL}/doctors/user/${doctorId}`;
        console.log('🧪 Testing URL:', url);
        const result = await apiRequest(url);
        console.log('🧪 Test result:', result);
        return result;
      } catch (error) {
        console.error('🧪 Test failed:', error);
        throw error;
      }
    },
    getApiBaseUrl: () => API_BASE_URL
  };
}

// Auth Service
export const authService = {
  // Đăng nhập với email/password
  async loginWithCredentials(credentials) {
    console.log(credentials);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      console.log(response);
      
      const data = await handleResponse(response);
      console.log(data);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  // Lấy thông tin user hiện tại
  // Get current user (use localStorage data instead of problematic API)
  async getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      // Use localStorage data instead of API call to avoid user not found errors
      const backendUserId = localStorage.getItem('backendUserId');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const userRole = localStorage.getItem('userRole');
      
      console.log('🔍 getCurrentUser - localStorage data:', {
        backendUserId,
        userName,
        userEmail,
        userRole
      });
      
      if (backendUserId && userRole) {
        return {
          user_id: parseInt(backendUserId),
          id: parseInt(backendUserId),
          full_name: userName || 'User',
          fullName: userName || 'User',
          email: userEmail,
          phone_number: '', // Will be fetched from API if needed
          phoneNumber: '', // Will be fetched from API if needed
          role_name: userRole,
          role: userRole
        };
      }

      // If no localStorage data, try API as fallback and handle errors gracefully
      try {
        console.log('🔄 Attempting fallback API call to /users/me');
        const data = await apiRequest(`${API_BASE_URL}/users/me`);
        console.log('✅ Successfully fetched from /users/me:', data);
        
        // Format the response to include both snake_case and camelCase fields
        return {
          user_id: data.userId || data.user_id,
          id: data.userId || data.user_id,
          full_name: data.fullName || data.full_name,
          fullName: data.fullName || data.full_name,
          email: data.email,
          phone_number: data.phoneNumber || data.phone_number || '',
          phoneNumber: data.phoneNumber || data.phone_number || '',
          role_name: data.role?.roleName || userRole,
          role: data.role?.roleName || userRole
        };
      } catch (apiError) {
        console.warn('API /users/me failed, using localStorage fallback:', apiError.message);
        return {
          user_id: backendUserId ? parseInt(backendUserId) : null,
          id: backendUserId ? parseInt(backendUserId) : null,
          full_name: userName || '',
          fullName: userName || '',
          email: userEmail || '',
          phone_number: '',
          phoneNumber: '',
          role_name: userRole || '',
          role: userRole || ''
        };
      }
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
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
    console.log(userData);
    
    try {
      console.log('🔄 Calling syncClerkUser API with data:', userData);
      const requestUrl = `${API_BASE_URL}/auth/clerk-sync`;
      console.log('📡 Request URL:', requestUrl);
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      console.log('📡 Raw response status:', response.status);
      console.log('📡 Raw response headers:', [...response.headers.entries()]);
      
      const data = await handleResponse(response);
      console.log('✅ syncClerkUser success data:', data);
      return data;
    } catch (error) {
      console.error('❌ Sync Clerk user error:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error instanceof:', error instanceof Error);
      if (error.response) {
        console.error('❌ Error response:', error.response);
      }
      throw error;
    }
  }
};

// Admin Service - Enhanced với better error handling
export const adminService = {
  // User Management
  async getAllUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      return await apiRequest(`${API_BASE_URL}/users?${queryParams}`);
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  },

  async searchUsers(keyword, role, params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      if (keyword) queryParams.append('keyword', keyword);
      if (role) queryParams.append('role', role);
      return await apiRequest(`${API_BASE_URL}/users/search?${queryParams}`);
    } catch (error) {
      console.error('Search users error:', error);
      throw error;
    }
  },

  async createUser(userData) {
    try {
      return await apiRequest(`${API_BASE_URL}/auth/create-user`, {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  async updateUser(userId, userData) {
    try {
      return await apiRequest(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  async updateUserContactInfo(userId, contactData) {
    try {
      return await apiRequest(`${API_BASE_URL}/users/${userId}/contact-info`, {
        method: 'PUT',
        body: JSON.stringify(contactData)
      });
    } catch (error) {
      console.error('Update user contact info error:', error);
      throw error;
    }
  },

  async deactivateUser(userId) {
    try {
      return await apiRequest(`${API_BASE_URL}/users/${userId}/deactivate`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Deactivate user error:', error);
      throw error;
    }
  },

  async activateUser(userId) {
    try {
      return await apiRequest(`${API_BASE_URL}/users/${userId}/activate`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Activate user error:', error);
      throw error;
    }
  },

  // Doctor Management
  async createDoctorProfile(userId, doctorData) {
    try {
      return await apiRequest(`${API_BASE_URL}/doctors/user/${userId}`, {
        method: 'POST',
        body: JSON.stringify(doctorData)
      });
    } catch (error) {
      console.error('Create doctor profile error:', error);
      throw error;
    }
  },

  async updateDoctor(doctorId, doctorData) {
    try {
      return await apiRequest(`${API_BASE_URL}/doctors/${doctorId}`, {
        method: 'PUT',
        body: JSON.stringify(doctorData)
      });
    } catch (error) {
      console.error('Update doctor error:', error);
      throw error;
    }
  },

  async assignSpecialty(doctorId, specialtyId) {
    try {
      return await apiRequest(`${API_BASE_URL}/doctors/${doctorId}/specialties/${specialtyId}`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Assign specialty error:', error);
      throw error;
    }
  },

  async assignDoctorSpecialty(doctorId, specialtyId, isPrimary = false) {
    try {
      return await apiRequest(`${API_BASE_URL}/doctors/${doctorId}/specialties/${specialtyId}?isPrimary=${isPrimary}`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Assign doctor specialty error:', error);
      throw error;
    }
  },

  async removeDoctorSpecialty(doctorId, specialtyId) {
    try {
      return await apiRequest(`${API_BASE_URL}/doctors/${doctorId}/specialties/${specialtyId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Remove doctor specialty error:', error);
      throw error;
    }
  },

  async getDoctorSpecialties(doctorId) {
    try {
      return await apiRequest(`${API_BASE_URL}/doctors/${doctorId}/specialties`);
    } catch (error) {
      console.error('Get doctor specialties error:', error);
      throw error;
    }
  },

  async deleteDoctor(doctorId) {
    try {
      return await apiRequest(`${API_BASE_URL}/doctors/${doctorId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Delete doctor error:', error);
      throw error;
    }
  },

  // Clinic Management
  async deleteClinic(clinicId) {
    try {
      console.log('🔄 API: Deleting clinic with ID:', clinicId);
      
      if (!clinicId) {
        throw new Error('Clinic ID is required for deletion');
      }
      
      const response = await apiRequest(`${API_BASE_URL}/clinics/${clinicId}`, {
        method: 'DELETE'
      });
      
      console.log('✅ API: Clinic deleted successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ API: Delete clinic error:', {
        clinicId,
        error: error.message,
        status: error.status,
        stack: error.stack
      });
      
      // Provide more specific error messages based on status code
      if (error.message?.includes('500') || error.message?.includes('Internal Server Error')) {
        throw new Error('Lỗi hệ thống khi xóa phòng khám. Có thể do:\n• Phòng khám có dữ liệu liên kết (appointments, doctors)\n• Lỗi database\n• Vui lòng liên hệ admin để xử lý.');
      } else if (error.message?.includes('404')) {
        throw new Error('Phòng khám không tồn tại hoặc đã bị xóa.');
      } else if (error.message?.includes('403')) {
        throw new Error('Bạn không có quyền xóa phòng khám này.');
      } else if (error.message?.includes('400')) {
        throw new Error('Không thể xóa phòng khám này. Có thể có dữ liệu liên quan cần được xóa trước.');
      } else if (error.message?.includes('Session expired')) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      
      throw error;
    }
  },

  async deleteSpecialty(specialtyId) {
    try {
      return await apiRequest(`${API_BASE_URL}/specialties/${specialtyId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Delete specialty error:', error);
      throw error;
    }
  },

  async createClinic(clinicData) {
    try {
      return await apiRequest(`${API_BASE_URL}/clinics`, {
        method: 'POST',
        body: JSON.stringify(clinicData)
      });
    } catch (error) {
      console.error('Create clinic error:', error);
      throw error;
    }
  },

  async updateClinic(clinicId, clinicData) {
    try {
      return await apiRequest(`${API_BASE_URL}/clinics/${clinicId}`, {
        method: 'PUT',
        body: JSON.stringify(clinicData)
      });
    } catch (error) {
      console.error('Update clinic error:', error);
      throw error;
    }
  },

  // Specialty Management
  async createSpecialty(specialtyData) {
    try {
      return await apiRequest(`${API_BASE_URL}/specialties`, {
        method: 'POST',
        body: JSON.stringify(specialtyData)
      });
    } catch (error) {
      console.error('Create specialty error:', error);
      throw error;
    }
  },

  async updateSpecialty(specialtyId, specialtyData) {
    try {
      return await apiRequest(`${API_BASE_URL}/specialties/${specialtyId}`, {
        method: 'PUT',
        body: JSON.stringify(specialtyData)
      });
    } catch (error) {
      console.error('Update specialty error:', error);
      throw error;
    }
  },

  // Doctor Schedule Management
  async createAvailabilitySlot(slotData) {
    try {
      return await apiRequest(`${API_BASE_URL}/doctor-schedules/availability`, {
        method: 'POST',
        body: JSON.stringify(slotData)
      });
    } catch (error) {
      console.error('Create availability slot error:', error);
      throw error;
    }
  },

  async createBulkSlots(slotsData) {
    try {
      return await apiRequest(`${API_BASE_URL}/doctor-schedules/bulk-availability`, {
        method: 'POST',
        body: JSON.stringify(slotsData)
      });
    } catch (error) {
      console.error('Create bulk slots error:', error);
      throw error;
    }
  },

  // Appointment Management
  async getAllAppointments(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      return await apiRequest(`${API_BASE_URL}/appointments?${queryParams}`);
    } catch (error) {
      console.error('Get all appointments error:', error);
      throw error;
    }
  },

  async createAppointment(appointmentData) {
    try {
      console.log('🔧 Admin creating appointment with data:', appointmentData);
      console.log('🔧 Data types:', {
        patientId: typeof appointmentData.patientId,
        doctorId: typeof appointmentData.doctorId,
        specialtyId: typeof appointmentData.specialtyId,
        clinicId: typeof appointmentData.clinicId,
        slotId: typeof appointmentData.slotId,
        appointmentDateTime: typeof appointmentData.appointmentDateTime
      });
      
      // Use same format as patient booking (both camelCase and snake_case)
      const processedData = {
        // Backend hỗ trợ cả camelCase và snake_case với @JsonAlias
        patientId: parseInt(appointmentData.patientId),
        patient_id: parseInt(appointmentData.patientId),
        
        doctorId: parseInt(appointmentData.doctorId),
        doctor_id: parseInt(appointmentData.doctorId),
        
        specialtyId: parseInt(appointmentData.specialtyId),
        specialty_id: parseInt(appointmentData.specialtyId),
        
        clinicId: parseInt(appointmentData.clinicId),
        clinic_id: parseInt(appointmentData.clinicId),
        
        slotId: parseInt(appointmentData.slotId),
        slot_id: parseInt(appointmentData.slotId),
        
        appointmentDateTime: appointmentData.appointmentDateTime,
        appointment_date_time: appointmentData.appointmentDateTime,
        
        reasonForVisit: appointmentData.reasonForVisit || '',
        reason_for_visit: appointmentData.reasonForVisit || '',
        
        // Admin tạo với deposit đã paid
        isDepositPaid: true,
        is_deposit_paid: true
        
        // Không gửi depositAmount để tránh validation lỗi
      };
      
      console.log('🔧 Processed data:', processedData);
      
      // Validate required fields
      const requiredFields = ['patientId', 'doctorId', 'specialtyId', 'clinicId', 'slotId', 'appointmentDateTime'];
      for (const field of requiredFields) {
        if (!processedData[field] || (typeof processedData[field] === 'number' && isNaN(processedData[field]))) {
          throw new Error(`Missing or invalid required field: ${field}`);
        }
      }
      
      // Try admin endpoint first
      try {
        return await apiRequest(`${API_BASE_URL}/admin/appointments`, {
          method: 'POST',
          body: JSON.stringify(processedData)
        });
      } catch (adminError) {
        console.warn('Admin endpoint failed, trying regular endpoint:', adminError.message);
        
        // Fallback to regular endpoint
        return await apiRequest(`${API_BASE_URL}/appointments`, {
          method: 'POST',
          body: JSON.stringify(processedData)
        });
      }
    } catch (error) {
      console.error('Admin create appointment error:', error);
      throw error;
    }
  },

  async updateAppointment(appointmentId, appointmentData) {
    try {
      return await apiRequest(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify(appointmentData)
      });
    } catch (error) {
      console.error('Update appointment error:', error);
      throw error;
    }
  },

  async updateAppointmentStatus(appointmentId, statusData) {
    try {
      return await apiRequest(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
        method: 'PUT',
        body: JSON.stringify(statusData)
      });
    } catch (error) {
      console.error('Update appointment status error:', error);
      throw error;
    }
  },

  async deleteAppointment(appointmentId) {
    try {
      return await apiRequest(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Delete appointment error:', error);
      throw error;
    }
  },

  // System Settings
  async getSystemConfig() {
    try {
      return await apiRequest(`${API_BASE_URL}/system-config`);
    } catch (error) {
      console.error('Get system config error:', error);
      throw error;
    }
  },

  async updateSystemConfig(configData) {
    try {
      return await apiRequest(`${API_BASE_URL}/system-config`, {
        method: 'PUT',
        body: JSON.stringify(configData)
      });
    } catch (error) {
      console.error('Update system config error:', error);
      throw error;
    }
  },

  // Payment Configuration - new methods
  async toggleMomoPayment(enableMomo) {
    try {
      const value = enableMomo ? 1 : 0;
      return await apiRequest(`${API_BASE_URL}/system-config/payment/momo/toggle?enableMomo=${value}`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Toggle MoMo payment error:', error);
      throw error;
    }
  },

  async toggleVNPayPayment(enableVNPay) {
    try {
      const value = enableVNPay ? 1 : 0;
      return await apiRequest(`${API_BASE_URL}/system-config/payment/vnpay/toggle?enableVNPay=${value}`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Toggle VNPay payment error:', error);
      throw error;
    }
  },

  async updateDefaultPaymentMethod(defaultPaymentMethod) {
    try {
      return await apiRequest(`${API_BASE_URL}/system-config/payment/default-method?defaultPaymentMethod=${defaultPaymentMethod}`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Update default payment method error:', error);
      throw error;
    }
  },

  async updateMomoConfiguration(momoConfig) {
    try {
      const params = new URLSearchParams();
      if (momoConfig.partnerCode) params.append('partnerCode', momoConfig.partnerCode);
      if (momoConfig.accessKey) params.append('accessKey', momoConfig.accessKey);
      if (momoConfig.secretKey) params.append('secretKey', momoConfig.secretKey);
      if (momoConfig.apiEndpoint) params.append('apiEndpoint', momoConfig.apiEndpoint);
      
      return await apiRequest(`${API_BASE_URL}/system-config/payment/momo?${params}`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Update MoMo configuration error:', error);
      throw error;
    }
  },

  async updateVNPayConfiguration(vnpayConfig) {
    try {
      const params = new URLSearchParams();
      if (vnpayConfig.tmnCode) params.append('tmnCode', vnpayConfig.tmnCode);
      if (vnpayConfig.secretKey) params.append('secretKey', vnpayConfig.secretKey);
      
      return await apiRequest(`${API_BASE_URL}/system-config/payment/vnpay?${params}`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Update VNPay configuration error:', error);
      throw error;
    }
  },

  async updateDepositAmount(amount) {
    try {
      return await apiRequest(`${API_BASE_URL}/system-config/deposit/amount?amount=${amount}`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Update deposit amount error:', error);
      throw error;
    }
  },

  async createDefaultConfiguration() {
    try {
      return await apiRequest(`${API_BASE_URL}/system-config/default`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Create default configuration error:', error);
      throw error;
    }
  },

  // Standard Work Shift Management
  async getAllStandardWorkShifts(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      return await apiRequest(`${API_BASE_URL}/standard-work-shifts?${queryParams}`);
    } catch (error) {
      console.error('Get all standard work shifts error:', error);
      throw error;
    }
  },

  async getStandardWorkShiftsByClinic(clinicId) {
    try {
      return await apiRequest(`${API_BASE_URL}/standard-work-shifts/clinic/${clinicId}`);
    } catch (error) {
      console.error('Get standard work shifts by clinic error:', error);
      throw error;
    }
  },

  async createStandardWorkShift(shiftData) {
    try {
      return await apiRequest(`${API_BASE_URL}/standard-work-shifts`, {
        method: 'POST',
        body: JSON.stringify(shiftData)
      });
    } catch (error) {
      console.error('Create standard work shift error:', error);
      throw error;
    }
  },

  async updateStandardWorkShift(shiftId, shiftData) {
    try {
      return await apiRequest(`${API_BASE_URL}/standard-work-shifts/${shiftId}`, {
        method: 'PUT',
        body: JSON.stringify(shiftData)
      });
    } catch (error) {
      console.error('Update standard work shift error:', error);
      throw error;
    }
  },

  async deleteStandardWorkShift(shiftId) {
    try {
      return await apiRequest(`${API_BASE_URL}/standard-work-shifts/${shiftId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Delete standard work shift error:', error);
      throw error;
    }
  },

  async setDefaultStandardWorkShift(shiftId) {
    try {
      return await apiRequest(`${API_BASE_URL}/standard-work-shifts/${shiftId}/set-default`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Set default standard work shift error:', error);
      throw error;
    }
  },

  async unsetDefaultStandardWorkShift(shiftId) {
    try {
      return await apiRequest(`${API_BASE_URL}/standard-work-shifts/${shiftId}/unset-default`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Unset default standard work shift error:', error);
      throw error;
    }
  },

  // Clinic Specialty Management
  async createClinicSpecialty(clinicId, specialtyData) {
    try {
      return await apiRequest(`${API_BASE_URL}/clinics/${clinicId}/specialties`, {
        method: 'POST',
        body: JSON.stringify(specialtyData)
      });
    } catch (error) {
      console.error('Create clinic specialty error:', error);
      throw error;
    }
  },

  async getClinicSpecialties(clinicId) {
    try {
      return await apiRequest(`${API_BASE_URL}/clinics/${clinicId}/specialties`);
    } catch (error) {
      console.error('Get clinic specialties error:', error);
      throw error;
    }
  },

  async updateClinicSpecialty(clinicId, specialtyId, specialtyData) {
    try {
      return await apiRequest(`${API_BASE_URL}/clinics/${clinicId}/specialties/${specialtyId}`, {
        method: 'PUT',
        body: JSON.stringify(specialtyData)
      });
    } catch (error) {
      console.error('Update clinic specialty error:', error);
      throw error;
    }
  },

  async deleteClinicSpecialty(clinicId, specialtyId) {
    try {
      return await apiRequest(`${API_BASE_URL}/clinics/${clinicId}/specialties/${specialtyId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Delete clinic specialty error:', error);
      throw error;
    }
  }
};

// Public API Service - Enhanced
export const apiService = {
  async getDashboardStats() {
    try {
      return await apiRequest(`${API_BASE_URL}/dashboard/stats`);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  async getTodayAppointments() {
    try {
      return await apiRequest(`${API_BASE_URL}/appointments/today`);
    } catch (error) {
      console.error('Get today appointments error:', error);
      throw error;
    }
  },

  // Lấy tất cả slot (bao gồm đã đặt) theo bác sĩ và ngày (chỉ Admin)
  async getAllSlotsByDoctorAndDate(doctorId, date) {
    try {
      const response = await fetch(`${API_BASE_URL}/availability/admin/slots/doctor/${doctorId}/date/${date}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Get all slots by doctor and date error:', error);
      throw error;
    }
  },

  // Doctor APIs
  async getDoctors(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      // Use publicApiRequest since this is a public endpoint
      return await publicApiRequest(`${API_BASE_URL}/doctors?${queryParams}`);
    } catch (error) {
      console.error('Get doctors error:', error);
      throw error;
    }
  },

  async getDoctorById(id) {
    try {
      return await apiRequest(`${API_BASE_URL}/doctors/${id}`);
    } catch (error) {
      console.error('Get doctor by id error:', error);
      throw error;
    }
  },

  async getDoctorsBySpecialty(specialtyId) {
    try {
      // Use publicApiRequest since this is a public endpoint
      return await publicApiRequest(`${API_BASE_URL}/doctors/specialty/${specialtyId}`);
    } catch (error) {
      console.error('Get doctors by specialty error:', error);
      throw error;
    }
  },

  async searchDoctorsByName(name, params = {}) {
    console.log('handleSearch called', name);
    try {
      const queryParams = new URLSearchParams({ name, ...params });
      const response = await fetch(`${API_BASE_URL}/doctors/search?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      console.log('Doctor search response:', response);
      console.log('Doctors in state:', response.content);
      console.log('API searchDoctorsByName called');
      return handleResponse(response);
    } catch (error) {
      console.error('Search doctors by name error:', error);
      throw error;
    }
  },

  async getDoctorsByExperience(yearsOfExperience) {
    try {
      return await apiRequest(`${API_BASE_URL}/doctors/experience/${yearsOfExperience}`);
    } catch (error) {
      console.error('Get doctors by experience error:', error);
      throw error;
    }
  },

  // Specialty APIs  
  async getSpecialties() {
    try {
      // Use publicApiRequest since this is a public endpoint
      return await publicApiRequest(`${API_BASE_URL}/specialties`);
    } catch (error) {
      console.error('Error fetching specialties:', error);
      throw error;
    }
  },

  async getSpecialtiesByClinic(clinicId) {
    try {
      return await apiRequest(`${API_BASE_URL}/specialties/clinic/${clinicId}`);
    } catch (error) {
      console.error('Get specialties by clinic error:', error);
      throw error;
    }
  },

  // Appointment APIs  
  async getMyAppointments() {
    try {
      // Lấy patient ID từ localStorage
      const backendUserId = localStorage.getItem('backendUserId');
      if (!backendUserId) {
        throw new Error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      }
      
      console.log('🔄 Getting appointments for patient ID:', backendUserId);
      
      // Sử dụng endpoint /appointments/patient/{patientId}
      return await apiRequest(`${API_BASE_URL}/appointments/patient/${backendUserId}`);
    } catch (error) {
      console.error('Get my appointments error:', error);
      throw error;
    }
  },

  async createAppointment(appointmentData) {
    try {
      console.log('DEBUG: createAppointment với dữ liệu:', appointmentData);
      
      const requestBody = JSON.stringify(appointmentData);
      const headers = getAuthHeaders();
      
      console.log('🚀 REQUEST DETAILS:');
      console.log('  - URL:', `${API_BASE_URL}/appointments`);
      console.log('  - Method: POST');
      console.log('  - Headers:', headers);
      console.log('  - Body (JSON):', requestBody);
      console.log('  - Body (parsed):', JSON.parse(requestBody));
      
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: headers,
        body: requestBody
      });
      
      // Log chi tiết lỗi nếu có
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', response.status, errorText);
        
        try {
          // Thử phân tích lỗi dạng JSON nếu có
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || `Lỗi ${response.status}: ${errorText}`);
        } catch (_parseError) {
          // Nếu không phải JSON, trả về lỗi dạng text
          throw new Error(`Lỗi ${response.status}: ${errorText}`);
        }
      }
      
      return handleResponse(response);
    } catch (error) {
      console.error('Create appointment error:', error);
      throw error;
    }
  },

  // Clinic APIs
  async getClinics(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      // Use publicApiRequest since this is a public endpoint
      return await publicApiRequest(`${API_BASE_URL}/clinics?${queryParams}`);
    } catch (error) {
      console.error('Get clinics error:', error);
      throw error;
    }
  },

  async getClinicSpecialties(clinicId) {
    try {
      return await apiRequest(`${API_BASE_URL}/clinics/${clinicId}/specialties`);
    } catch (error) {
      console.error('Get clinic specialties error:', error);
      throw error;
    }
  },

  async createClinicSpecialty(clinicId, specialtyData) {
    try {
      return await apiRequest(`${API_BASE_URL}/clinics/${clinicId}/specialties`, {
        method: 'POST',
        body: JSON.stringify(specialtyData)
      });
    } catch (error) {
      console.error('Create clinic specialty error:', error);
      throw error;
    }
  },

  async updateClinicSpecialty(clinicId, specialtyId, specialtyData) {
    try {
      return await apiRequest(`${API_BASE_URL}/clinics/${clinicId}/specialties/${specialtyId}`, {
        method: 'PUT',
        body: JSON.stringify(specialtyData)
      });
    } catch (error) {
      console.error('Update clinic specialty error:', error);
      throw error;
    }
  },

  async deleteClinicSpecialty(clinicId, specialtyId) {
    try {
      return await apiRequest(`${API_BASE_URL}/clinics/${clinicId}/specialties/${specialtyId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Delete clinic specialty error:', error);
      throw error;
    }
  },

  // Lấy thông tin phòng khám theo ID
  async getClinicById(clinicId) {
    try {
      // Use publicApiRequest since this is a public endpoint
      return await publicApiRequest(`${API_BASE_URL}/clinics/${clinicId}`);
    } catch (error) {
      console.error('Get clinic error:', error);
      throw error;
    }
  },

  // Lấy thôngtin bác sĩ theo user ID
  async getDoctorByUserId(doctorId) {
    try {
      console.log('Gọi API getDoctorByUserId với doctorId:', doctorId);
      // Use publicApiRequest since this is a public endpoint
      const data = await publicApiRequest(`${API_BASE_URL}/doctors/${doctorId}`);
      console.log('Dữ liệu bác sĩ nhận được từ API:', data);
      
      // Nếu đã có clinic object thì trả về ngay
      if (data && data.clinic && typeof data.clinic === 'object') {
        console.log('Đã có clinic object trong dữ liệu bác sĩ');
        return data;
      }
      
      // Nếu API chỉ trả về clinic_id và không có clinic object
      if (data && (data.clinicId || data.clinic_id)) {
        try {
          const clinicId = data.clinicId || data.clinic_id;
          console.log('Gọi API lấy thông tin phòng khám với clinic_id:', clinicId);
          const clinicData = await this.getClinicById(clinicId);
          console.log('Dữ liệu phòng khám nhận được:', clinicData);
          data.clinic = clinicData;
        } catch (clinicError) {
          console.warn('Không thể lấy thông tin phòng khám:', clinicError);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Get doctor error:', error);
      throw error;
    }
  },

  async getStandardWorkShiftsByClinic(clinicId) {
    try {
      console.log(`📡 Fetching standard work shifts for clinic ID: ${clinicId}`);
      // This is the correct endpoint based on StandardWorkShiftController.java
      // Use publicApiRequest since this is a public endpoint that doesn't require authentication
      return await publicApiRequest(`${API_BASE_URL}/standard-work-shifts/clinic/${clinicId}`);
    } catch (error) {
      console.error('Get standard work shifts by clinic error:', error);
      throw error;
    }
  },

  // Lấy slot khả dụng theo bác sĩ và ngày
  async getAvailableSlots(doctorId, date) {
    try {
      console.log(`📡 Fetching available slots for doctor ID: ${doctorId} and date: ${date}`);
      // Use publicApiRequest since this is a public endpoint
      return await publicApiRequest(`${API_BASE_URL}/availability/slots/doctor/${doctorId}/date/${date}`);
    } catch (error) {
      console.error('Get available slots error:', error);
      throw error;
    }
  },
};

// Doctor Service
export const doctorService = {
  // Cache for doctor info to avoid repeated API calls
  _doctorInfoCache: null,
  _cacheTimestamp: null,
  _cacheTimeout: 5 * 60 * 1000, // 5 minutes

  // Helper method to get doctor info with caching
  async _getDoctorInfo() {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this._doctorInfoCache && this._cacheTimestamp && (now - this._cacheTimestamp) < this._cacheTimeout) {
      console.log('🎯 Using cached doctor info:', this._doctorInfoCache);
      return this._doctorInfoCache;
    }
    
    // Debug: Check all localStorage values
    const backendUserId = localStorage.getItem('backendUserId');
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    console.log('🔍 localStorage debug:', {
      backendUserId,
      hasToken: !!token,
      tokenLength: token?.length,
      userRole,
      allKeys: Object.keys(localStorage)
    });
    
    if (!backendUserId) {
      console.error('❌ No backendUserId found in localStorage');
      throw new Error('Dữ liệu xác thực không hợp lệ. Vui lòng đăng nhập lại.');
    }
    
    if (!token) {
      console.error('❌ No token found in localStorage');
      throw new Error('Dữ liệu xác thực không hợp lệ. Vui lòng đăng nhập lại.');
    }
    
    if (userRole !== 'DOCTOR') {
      console.error('❌ User role is not DOCTOR:', userRole);
      throw new Error('Tài khoản không có quyền truy cập doctor dashboard');
    }
    
    // Fetch fresh data
    const apiUrl = `${API_BASE_URL}/doctors/user/${backendUserId}`;
    console.log('📡 Calling API:', apiUrl);
    
    try {
      const doctorInfo = await apiRequest(apiUrl);
      console.log('📋 Doctor info response:', doctorInfo);
      
      // Check for doctor_id (backend uses snake_case) OR doctorId (camelCase)
      if (!doctorInfo || (!doctorInfo.doctor_id && !doctorInfo.doctorId)) {
        console.error('❌ Invalid doctor info received:', doctorInfo);
        throw new Error('Không tìm thấy thông tin bác sĩ. Vui lòng liên hệ admin để tạo hồ sơ bác sĩ.');
      }
      
      // Normalize the response to use camelCase for consistency
      if (doctorInfo.doctor_id && !doctorInfo.doctorId) {
        doctorInfo.doctorId = doctorInfo.doctor_id;
      }
      
      // Normalize years_of_experience field
      if (doctorInfo.years_of_experience !== undefined && doctorInfo.yearsOfExperience === undefined) {
        doctorInfo.yearsOfExperience = doctorInfo.years_of_experience;
      }
      
      // Normalize user fields
      if (doctorInfo.user) {
        if (doctorInfo.user.user_id && !doctorInfo.user.userId) {
          doctorInfo.user.userId = doctorInfo.user.user_id;
        }
        if (doctorInfo.user.full_name && !doctorInfo.user.fullName) {
          doctorInfo.user.fullName = doctorInfo.user.full_name;
        }
        if (doctorInfo.user.phone_number && !doctorInfo.user.phoneNumber) {
          doctorInfo.user.phoneNumber = doctorInfo.user.phone_number;
        }
      }
      
      // Cache the result
      this._doctorInfoCache = doctorInfo;
      this._cacheTimestamp = now;
      
      console.log('✅ Successfully cached doctor info:', doctorInfo);
      return doctorInfo;
      
    } catch (error) {
      console.error('❌ API call failed:', error);
      
      // Check if it's an authentication error
      if (error.message.includes('401') || error.message.includes('403') || 
          error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        throw new Error('Dữ liệu xác thực không hợp lệ. Vui lòng đăng nhập lại.');
      }
      
      // Check if it's a not found error
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        throw new Error('Không tìm thấy thông tin bác sĩ. Vui lòng liên hệ admin để tạo hồ sơ bác sĩ.');
      }
      
      // Re-throw the original error for other cases
      throw error;
    }
  },

  // Clear cache (useful for logout or profile updates)
  _clearCache() {
    this._doctorInfoCache = null;
    this._cacheTimestamp = null;
  },
  // Get doctor's schedule using admin API
  async getMySchedule(params = {}) {
    try {
      const doctorInfo = await this._getDoctorInfo();
      const queryParams = new URLSearchParams(params);
      return await apiRequest(`${API_BASE_URL}/availability/slots/doctor/${doctorInfo.doctorId}?${queryParams}`);
    } catch (error) {
      console.error('Get my schedule error:', error);
      throw handleApiError(error, 'getMySchedule');
    }
  },

  // Get doctor's appointments using admin API
  async getMyAppointments(params = {}) {
    try {
      const doctorInfo = await this._getDoctorInfo();
      const queryParams = new URLSearchParams(params);
      return await apiRequest(`${API_BASE_URL}/appointments/doctor/${doctorInfo.doctorId}?${queryParams}`);
    } catch (error) {
      console.error('Get my appointments error:', error);
      throw handleApiError(error, 'getMyAppointments');
    }
  },

  // Update doctor profile using admin API
  async updateMyProfile(profileData) {
    try {
      const doctorInfo = await this._getDoctorInfo();
      
      // Separate doctor data and user data
      const { bio, yearsOfExperience, fullName, phoneNumber, ...otherData } = profileData;
      
      // Update doctor profile (bio, yearsOfExperience)
      if (bio !== undefined || yearsOfExperience !== undefined) {
        const doctorUpdateData = {};
        if (bio !== undefined) doctorUpdateData.bio = bio;
        if (yearsOfExperience !== undefined) doctorUpdateData.yearsOfExperience = yearsOfExperience;
        
        await apiRequest(`${API_BASE_URL}/doctors/${doctorInfo.doctorId}`, {
          method: 'PUT',
          body: JSON.stringify(doctorUpdateData)
        });
      }
      
      // Update user profile (fullName, phoneNumber) - but NOT email
      if ((fullName !== undefined && fullName !== doctorInfo.user?.fullName) || 
          (phoneNumber !== undefined && phoneNumber !== doctorInfo.user?.phoneNumber)) {
        const userUpdateData = {};
        if (fullName !== undefined) userUpdateData.fullName = fullName;
        if (phoneNumber !== undefined) userUpdateData.phoneNumber = phoneNumber;
        
        await apiRequest(`${API_BASE_URL}/users/${doctorInfo.user.userId}`, {
          method: 'PUT',
          body: JSON.stringify(userUpdateData)
        });
      }
      
      // Clear cache to force refresh on next call
      this._clearCache();
      
      return { success: true };
    } catch (error) {
      console.error('Update my profile error:', error);
      throw handleApiError(error, 'updateMyProfile');
    }
  },

  // Update doctor profile (for self-update via profile management)
  async updateDoctorProfile(doctorId, doctorData) {
    try {
      console.log('🔄 Updating doctor profile:', doctorId, doctorData);
      
      const response = await apiRequest(`${API_BASE_URL}/doctors/${doctorId}`, {
        method: 'PUT',
        body: JSON.stringify(doctorData)
      });

      console.log('✅ Doctor profile updated successfully');
      return response;
    } catch (error) {
      console.error('❌ Error updating doctor profile:', error);
      throw error;
    }
  },

  // Update user profile (for self-update, excluding email)
  async updateUserProfile(userId, userData) {
    try {
      console.log('🔄 Updating user profile:', userId, userData);
      
      // Remove email from userData if present (doctor can't change email)
      const { email, ...userDataWithoutEmail } = userData;
      
      const response = await apiRequest(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userDataWithoutEmail)
      });

      console.log('✅ User profile updated successfully');
      return response;
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  },

  // Get doctor's specialties and clinics using admin API
  async getMySpecialties() {
    try {
      const doctorInfo = await this._getDoctorInfo();
      
      if (doctorInfo && doctorInfo.specialties) {
        // Return specialties with doctor info attached
        return doctorInfo.specialties.map(specialty => ({
          ...specialty,
          doctorId: doctorInfo.doctorId,
          bio: doctorInfo.bio,
          yearsOfExperience: doctorInfo.yearsOfExperience,
          fullName: doctorInfo.user?.fullName,
          email: doctorInfo.user?.email,
          phoneNumber: doctorInfo.user?.phoneNumber,
          userId: doctorInfo.user?.userId
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Get my specialties error:', error);
      throw handleApiError(error, 'getMySpecialties');
    }
  },

  // Get my doctor profile using admin API
  async getMyProfile() {
    try {
      const doctorInfo = await this._getDoctorInfo();
      
      return {
        doctorId: doctorInfo.doctorId,
        bio: doctorInfo.bio || '',
        yearsOfExperience: doctorInfo.years_of_experience || doctorInfo.yearsOfExperience || 0,
        years_of_experience: doctorInfo.years_of_experience || doctorInfo.yearsOfExperience || 0, // Include both formats
        specialties: doctorInfo.specialties || [],
        user: doctorInfo.user || {}
      };
    } catch (error) {
      console.error('Get my profile error:', error);
      throw handleApiError(error, 'getMyProfile');
    }
  },

  // Helper method to get current user
  async getCurrentUser() {
    try {
      // Get user info from localStorage first
      const backendUserId = localStorage.getItem('backendUserId');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const userRole = localStorage.getItem('userRole');
      
      if (backendUserId && userRole) {
        return {
          userId: parseInt(backendUserId),
          fullName: userName || 'Bác sĩ',
          email: userEmail,
          role: userRole
        };
      }
      
      throw new Error('Không thể xác định thông tin người dùng hiện tại');
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // Get my availability slots
  async getMyAvailabilitySlots(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      return await apiRequest(`${API_BASE_URL}/doctor-schedules/my-availability?${queryParams}`);
    } catch (error) {
      console.error('Get my availability slots error:', error);
      throw handleApiError(error, 'getMyAvailabilitySlots');
    }
  },

  // Create availability slot
  async createMyAvailabilitySlot(slotData) {
    try {
      return await apiRequest(`${API_BASE_URL}/doctor-schedules/my-availability`, {
        method: 'POST',
        body: JSON.stringify(slotData)
      });
    } catch (error) {
      console.error('Create my availability slot error:', error);
      throw handleApiError(error, 'createMyAvailabilitySlot');
    }
  },

  // Update availability slot
  async updateMyAvailabilitySlot(slotId, slotData) {
    try {
      return await apiRequest(`${API_BASE_URL}/doctor-schedules/my-availability/${slotId}`, {
        method: 'PUT',
        body: JSON.stringify(slotData)
      });
    } catch (error) {
      console.error('Update my availability slot error:', error);
      throw handleApiError(error, 'updateMyAvailabilitySlot');
    }
  },

  // Delete availability slot
  async deleteMyAvailabilitySlot(slotId) {
    try {
      return await apiRequest(`${API_BASE_URL}/doctor-schedules/my-availability/${slotId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Delete my availability slot error:', error);
      throw handleApiError(error, 'deleteMyAvailabilitySlot');
    }
  },

  // Get standard work shifts for my clinics
  async getMyStandardWorkShifts() {
    try {
      return await apiRequest(`${API_BASE_URL}/standard-work-shifts/my-clinics`);
    } catch (error) {
      console.error('Get my standard work shifts error:', error);
      throw handleApiError(error, 'getMyStandardWorkShifts');
    }
  },

  // Enhanced slot generation from work shifts with advanced options
  async generateSlotsFromWorkShifts(requestData) {
    try {
      // Handle both old format (specialtyId, clinicId, dateRange, options) and new format (requestData object)
      let payload;
      
      if (typeof requestData === 'object' && requestData.specialtyId) {
        // New format: single object parameter
        payload = {
          specialtyId: requestData.specialtyId,
          clinicId: requestData.clinicId,
          startDate: requestData.startDate,
          endDate: requestData.endDate,
          slotDurationMinutes: requestData.slotDurationMinutes || 30,
          overwrite: requestData.overwrite || false,
          skipWeekends: requestData.skipWeekends !== false, // Default true
          autoEnable: requestData.autoEnable || false,
          notes: requestData.notes || ''
        };
      } else {
        // Legacy format: multiple parameters (for backward compatibility)
        const [specialtyId, clinicId, dateRange, options = {}] = arguments;
        payload = {
          specialtyId,
          clinicId,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          slotDurationMinutes: options.slotDurationMinutes || 30,
          overwrite: options.overwrite || false,
          skipWeekends: options.skipWeekends !== false, // Default true
          autoEnable: options.autoEnable || false,
          notes: options.notes || ''
        };
      }
      
      console.log('🚀 Enhanced slot generation:', payload);
      return await apiRequest(`${API_BASE_URL}/doctor-schedules/bulk-from-work-shifts`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Enhanced slot generation error:', error);
      throw handleApiError(error, 'generateSlotsFromWorkShifts');
    }
  },

  // Create bulk slots based on standard work shifts (legacy support)
  async createBulkSlotsFromWorkShifts(bulkData) {
    try {
      return await apiRequest(`${API_BASE_URL}/doctor-schedules/bulk-from-work-shifts`, {
        method: 'POST',
        body: JSON.stringify(bulkData)
      });
    } catch (error) {
      console.error('Create bulk slots from work shifts error:', error);
      throw handleApiError(error, 'createBulkSlotsFromWorkShifts');
    }
  },

  // Get availability slots for a specific specialty and date range
  async getMyAvailabilitySlotsBySpecialty(specialtyId, params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      return await apiRequest(`${API_BASE_URL}/doctor-schedules/my-availability/specialty/${specialtyId}?${queryParams}`);
    } catch (error) {
      console.error('Get my availability slots by specialty error:', error);
      throw handleApiError(error, 'getMyAvailabilitySlotsBySpecialty');
    }
  },

  // Toggle slot availability (for schedule management)
  async toggleSlotAvailability(slotId, isAvailable) {
    try {
      return await apiRequest(`${API_BASE_URL}/doctor-schedules/my-availability/${slotId}/toggle`, {
        method: 'PUT',
        body: JSON.stringify({ isAvailable })
      });
    } catch (error) {
      console.error('Toggle slot availability error:', error);
      throw handleApiError(error, 'toggleSlotAvailability');
    }
  },

  // Enhanced conflict checking with detailed information
  async checkSlotConflicts(slotTime, currentSpecialtyId, doctorId = null) {
    try {
      const payload = { 
        slotTime, 
        currentSpecialtyId,
        ...(doctorId && { doctorId })
      };
      
      console.log('🔍 Checking slot conflicts:', payload);
      return await apiRequest(`${API_BASE_URL}/doctor-schedules/check-conflicts`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Check slot conflicts error:', error);
      throw handleApiError(error, 'checkSlotConflicts');
    }
  },

  // Resolve slot conflicts by disabling conflicting slots
  async resolveSlotConflicts(action, slotTime, targetSpecialtyId) {
    try {
      const payload = {
        action: action,
        slotTime: slotTime,
        targetSpecialtyId: targetSpecialtyId
      };

      console.log('🔧 Resolving slot conflicts:', payload);
      return await apiRequest(`${API_BASE_URL}/doctor-schedules/resolve-conflicts`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Resolve slot conflicts error:', error);
      throw handleApiError(error, 'resolveSlotConflicts');
    }
  },

  // Batch slot toggle with conflict resolution
  async batchToggleSlots(slotUpdates) {
    try {
      console.log('📦 Batch slot toggle:', slotUpdates);
      return await apiRequest(`${API_BASE_URL}/doctor-schedules/batch-toggle`, {
        method: 'PUT',
        body: JSON.stringify({ updates: slotUpdates })
      });
    } catch (error) {
      console.error('Batch toggle slots error:', error);
      throw handleApiError(error, 'batchToggleSlots');
    }
  },

  // Batch slot operations with advanced options
  async batchSlotOperations(operation, slotIds, options = {}) {
    try {
      const payload = {
        operation, // 'enable', 'disable', 'delete'
        slotIds,
        options
      };
      
      console.log('⚡ Batch slot operations:', payload);
      return await apiRequest(`${API_BASE_URL}/doctor-schedules/batch-operations`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Batch slot operations error:', error);
      throw handleApiError(error, 'batchSlotOperations');
    }
  },

  // Get detailed slot statistics
  async getSlotStatistics(specialtyId, dateRange) {
    try {
      const params = new URLSearchParams({
        specialtyId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      return await apiRequest(`${API_BASE_URL}/doctor-schedules/statistics?${params}`);
    } catch (error) {
      console.error('Get slot statistics error:', error);
      throw handleApiError(error, 'getSlotStatistics');
    }
  },

  // Get clinic work shifts for specific specialty
  async getWorkShiftsBySpecialty(specialtyId) {
    try {
      return await apiRequest(`${API_BASE_URL}/standard-work-shifts/specialty/${specialtyId}`);
    } catch (error) {
      console.error('Get work shifts by specialty error:', error);
      throw handleApiError(error, 'getWorkShiftsBySpecialty');
    }
  },

  // Create slots automatically based on clinic work shifts and specialty
  async generateSlotsFromClinicShifts(data) {
    try {
      return await apiRequest(`${API_BASE_URL}/doctor-schedules/generate-from-clinic-shifts`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Generate slots from clinic shifts error:', error);
      throw handleApiError(error, 'generateSlotsFromClinicShifts');
    }
  },

  // Update appointment status as doctor
  async updateMyAppointmentStatus(appointmentId, statusData) {
    try {
      return await apiRequest(`${API_BASE_URL}/appointments/doctor/${appointmentId}/status`, {
        method: 'PUT',
        body: JSON.stringify(statusData)
      });
    } catch (error) {
      console.error('Update my appointment status error:', error);
      throw handleApiError(error, 'updateMyAppointmentStatus');
    }
  },

  // Get schedule conflicts summary
  async getScheduleConflictsSummary(dateRange) {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      return await apiRequest(`${API_BASE_URL}/doctor-schedules/conflicts-summary?${params}`);
    } catch (error) {
      console.error('Get schedule conflicts summary error:', error);
      throw handleApiError(error, 'getScheduleConflictsSummary');
    }
  },

  // Resolve schedule conflict automatically
  async resolveScheduleConflict(conflictId, resolution) {
    try {
      const payload = {
        conflictId,
        resolution // 'disable_conflicting', 'keep_current', 'merge_schedules'
      };
      
      console.log('🔧 Resolving schedule conflict:', payload);
      return await apiRequest(`${API_BASE_URL}/doctor-schedules/resolve-conflict`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Resolve schedule conflict error:', error);
      throw handleApiError(error, 'resolveScheduleConflict');
    }
  },

  // Lấy danh sách availability slots của bác sĩ
  async getAvailabilitySlots(doctorId, page = 0, size = 10) {
    try {
      const params = new URLSearchParams({ page, size });
      const response = await apiRequest(`${API_BASE_URL}/doctor-schedules/doctor/${doctorId}?${params.toString()}`);
      return response; // Assuming the backend returns { content: [], totalPages: X, ... }
    } catch (error) {
      console.error('Error fetching availability slots:', error);
      throw handleApiError(error, 'GET_AVAILABILITY_SLOTS');
    }
  }
};

// Helper functions for API operations
export const apiUtils = {
  // Format date for API
  formatDate: (date) => {
    if (!date) return null;
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  },

  // Format time for API
  formatTime: (time) => {
    if (!time) return null;
    if (typeof time === 'string') return time;
    return time.toTimeString().split(' ')[0].slice(0, 5);
  },

  // Build query params
  buildQueryParams: (params) => {
    const filteredParams = Object.entries(params)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
    
    return new URLSearchParams(filteredParams);
  },

  // Validate date range
  validateDateRange: (startDate, endDate) => {
    if (!startDate || !endDate) {
      throw new Error('Vui lòng chọn khoảng thời gian');
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      throw new Error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
    }
    
    const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
    if (daysDiff > 90) {
      throw new Error('Khoảng thời gian không được vượt quá 90 ngày');
    }
    
    return true;
  },

  // Validate slot data
  validateSlotData: (slotData) => {
    const required = ['doctorId', 'date', 'startTime', 'endTime', 'clinicId'];
    const missing = required.filter(field => !slotData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Thiếu thông tin: ${missing.join(', ')}`);
    }
    
    const startTime = new Date(`1970-01-01T${slotData.startTime}`);
    const endTime = new Date(`1970-01-01T${slotData.endTime}`);
    
    if (startTime >= endTime) {
      throw new Error('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc');
    }
    
    return true;
  }
};

export default { authService, apiService, adminService, doctorService };
