import { API_BASE_URL } from './api';

// Helper function để thêm token vào headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function for handling API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Check for auth errors
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      throw new Error(errorData.message || 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    }
    
    // Handle other error types
    throw new Error(errorData.message || `Lỗi server: ${response.status}`);
  }

  // Check if response is empty
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return { success: true };
  }
  
  return response.json();
};

// Helper function for API requests
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {})
      }
    });
    return handleResponse(response);
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Service quản lý ngày nghỉ của phòng khám
export const clinicOfflineService = {
  async getClinicOfflineDates(clinicId, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/clinics/${clinicId}/offline-dates${queryString ? `?${queryString}` : ''}`;
      return await apiRequest(url);
    } catch (error) {
      console.error('Get clinic offline dates error:', error);
      throw error;
    }
  },

  async getAllClinicOfflineDates(clinicId) {
    try {
      const url = `${API_BASE_URL}/clinics/${clinicId}/offline-dates/all`;
      return await apiRequest(url);
    } catch (error) {
      console.error('Get all clinic offline dates error:', error);
      throw error;
    }
  },

  async getClinicOfflineDatesByRange(clinicId, startDate, endDate) {
    try {
      const url = `${API_BASE_URL}/clinics/${clinicId}/offline-dates/range?startDate=${startDate}&endDate=${endDate}`;
      return await apiRequest(url);
    } catch (error) {
      console.error('Get clinic offline dates by range error:', error);
      throw error;
    }
  },

  async isClinicOfflineOnDate(clinicId, date) {
    try {
      const url = `${API_BASE_URL}/clinics/${clinicId}/is-offline?date=${date}`;
      const response = await apiRequest(url);
      return response.data; // Return the boolean value from ApiResponse.data
    } catch (error) {
      console.error('Is clinic offline on date error:', error);
      throw error;
    }
  },

  async getUpcomingClinicOfflineDates(clinicId) {
    try {
      const url = `${API_BASE_URL}/clinics/${clinicId}/offline-dates/upcoming`;
      return await apiRequest(url);
    } catch (error) {
      console.error('Get upcoming clinic offline dates error:', error);
      throw error;
    }
  },

  async getRecurringClinicOfflineDates(clinicId, recurringType) {
    try {
      const url = `${API_BASE_URL}/clinics/${clinicId}/offline-dates/recurring/${recurringType}`;
      return await apiRequest(url);
    } catch (error) {
      console.error('Get recurring clinic offline dates error:', error);
      throw error;
    }
  },

  async createClinicOfflineDate(clinicId, offlineDateData) {
    try {
      const url = `${API_BASE_URL}/clinics/${clinicId}/offline-dates`;
      return await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(offlineDateData)
      });
    } catch (error) {
      console.error('Create clinic offline date error:', error);
      throw error;
    }
  },

  async updateClinicOfflineDate(clinicId, offlineDateId, offlineDateData) {
    try {
      const url = `${API_BASE_URL}/clinics/${clinicId}/offline-dates/${offlineDateId}`;
      return await apiRequest(url, {
        method: 'PUT',
        body: JSON.stringify(offlineDateData)
      });
    } catch (error) {
      console.error('Update clinic offline date error:', error);
      throw error;
    }
  },

  async deleteClinicOfflineDate(clinicId, offlineDateId) {
    try {
      const url = `${API_BASE_URL}/clinics/${clinicId}/offline-dates/${offlineDateId}`;
      return await apiRequest(url, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Delete clinic offline date error:', error);
      throw error;
    }
  }
}; 