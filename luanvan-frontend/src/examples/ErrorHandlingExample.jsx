// Example: Enhanced Error Handling Usage in Components
// This file demonstrates how to use the new error handling system

import React, { useState, useEffect } from 'react';
import { useNotification } from '../components/NotificationSystem';
import { getErrorHandler, OPERATION_MESSAGES } from '../services/errorHandler';
import { apiService, adminService } from '../services/api';

const ExampleComponent = () => {
  const notificationService = useNotification();
  const errorHandler = getErrorHandler(notificationService);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  // Example 1: Simple API call with automatic error handling
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDoctors();
      setData(response.content || response || []);
      notificationService.showSuccess('Dữ liệu đã được tải thành công');
    } catch (error) {
      // Use specific error handler
      errorHandler.handleApiError(error, OPERATION_MESSAGES.fetchDoctors);
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Validation error handling
  const createDoctor = async (formData) => {
    try {
      setLoading(true);
      
      // Client-side validation
      const validationErrors = [];
      if (!formData.bio) validationErrors.push('Tiểu sử không được để trống');
      if (!formData.yearsOfExperience || formData.yearsOfExperience < 0) {
        validationErrors.push('Số năm kinh nghiệm phải lớn hơn 0');
      }
      
      if (validationErrors.length > 0) {
        errorHandler.handleValidationError(validationErrors, OPERATION_MESSAGES.createDoctor);
        return;
      }
      
      // API call
      const response = await adminService.createDoctorProfile(formData.userId, formData);
      notificationService.showSuccess('Hồ sơ bác sĩ đã được tạo thành công');
      return response;
    } catch (error) {
      errorHandler.handleApiError(error, OPERATION_MESSAGES.createDoctor, {
        showDetails: true // Show detailed error info
      });
    } finally {
      setLoading(false);
    }
  };

  // Example 3: Batch operations with error handling
  const batchDeleteDoctors = async (doctorIds) => {
    const errors = [];
    const successes = [];
    
    setLoading(true);
    
    for (const doctorId of doctorIds) {
      try {
        await adminService.deleteDoctor(doctorId);
        successes.push(doctorId);
      } catch (error) {
        errors.push({ doctorId, error });
      }
    }
    
    // Handle results
    if (successes.length > 0) {
      notificationService.showSuccess(
        `Đã xóa thành công ${successes.length} bác sĩ`,
        'Xóa thành công'
      );
    }
    
    if (errors.length > 0) {
      errorHandler.handleBatchErrors(
        errors.map(e => e.error), 
        'xóa bác sĩ hàng loạt'
      );
    }
    
    setLoading(false);
  };

  // Example 4: Network error with retry functionality
  const fetchWithRetry = async (retryCount = 3) => {
    try {
      setLoading(true);
      const response = await apiService.getDoctors();
      setData(response.content || response || []);
    } catch (error) {
      if (retryCount > 0 && error.message?.includes('network')) {
        // Show network error with retry option
        errorHandler.handleNetworkError(error, {
          actions: [
            {
              label: `Thử lại (${retryCount})`,
              style: 'primary',
              onClick: () => fetchWithRetry(retryCount - 1)
            }
          ]
        });
      } else {
        errorHandler.handleApiError(error, OPERATION_MESSAGES.fetchDoctors);
      }
    } finally {
      setLoading(false);
    }
  };

  // Example 5: Authentication error handling
  const fetchProtectedData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      setData(response);
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        errorHandler.handleAuthError(error);
      } else {
        errorHandler.handleApiError(error, 'tải thống kê');
      }
    } finally {
      setLoading(false);
    }
  };

  // Example 6: Using API wrapper for automatic error handling
  const wrappedFetchDoctors = errorHandler.createApiWrapper(
    apiService.getDoctors,
    OPERATION_MESSAGES.fetchDoctors,
    { showDetails: true }
  );

  const fetchDoctorsWithWrapper = async () => {
    try {
      setLoading(true);
      const response = await wrappedFetchDoctors();
      setData(response.content || response || []);
      notificationService.showSuccess('Dữ liệu đã được tải thành công');
    } catch (error) {
      // Error already handled by wrapper
    } finally {
      setLoading(false);
    }
  };

  // Example 7: Form submission with comprehensive error handling
  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      
      // Validate form data
      const validationErrors = validateFormData(formData);
      if (validationErrors.length > 0) {
        errorHandler.handleValidationError(validationErrors, 'nhập liệu');
        return;
      }
      
      // Submit data
      const response = await adminService.createUser(formData);
      
      notificationService.showSuccess(
        'Người dùng đã được tạo thành công',
        'Tạo thành công',
        {
          actions: [
            {
              label: 'Xem chi tiết',
              style: 'secondary',
              onClick: () => console.log('User created:', response)
            }
          ]
        }
      );
      
    } catch (error) {
      // Handle different types of errors appropriately
      if (error.response?.data?.details) {
        // Backend validation errors
        errorHandler.handleValidationError(
          error.response.data.details,
          OPERATION_MESSAGES.createUser
        );
      } else {
        // Other API errors
        errorHandler.handleApiError(error, OPERATION_MESSAGES.createUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const validateFormData = (data) => {
    const errors = [];
    if (!data.email) errors.push('Email là bắt buộc');
    if (!data.fullName) errors.push('Họ tên là bắt buộc');
    if (!data.password || data.password.length < 6) {
      errors.push('Mật khẩu phải có ít nhất 6 ký tự');
    }
    return errors;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Error Handling Examples</h2>
      
      <div className="space-y-4">
        <button 
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Đang tải...' : 'Tải dữ liệu'}
        </button>
        
        <button 
          onClick={fetchWithRetry}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Tải với retry
        </button>
        
        <button 
          onClick={fetchProtectedData}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Tải dữ liệu bảo mật
        </button>
        
        <button 
          onClick={fetchDoctorsWithWrapper}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Tải với wrapper
        </button>
      </div>
      
      {data.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Dữ liệu đã tải:</h3>
          <p className="text-gray-600">{data.length} mục</p>
        </div>
      )}
    </div>
  );
};

export default ExampleComponent;
