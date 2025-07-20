// Enhanced Error Handling Service
// This service provides centralized error handling with specific messages for different contexts

export class ApiErrorHandler {
  constructor(notificationService) {
    this.notificationService = notificationService;
  }

  // Handle API errors with context
  handleApiError(error, operation = '', options = {}) {
    const { silent = false, showDetails = false } = options;
    
    if (silent) {
      console.error(`Silent API Error [${operation}]:`, error);
      return;
    }

    if (this.notificationService?.showApiError) {
      this.notificationService.showApiError(error, operation, {
        actions: showDetails ? [
          {
            label: 'Chi tiết',
            style: 'secondary',
            onClick: () => this.showErrorDetails(error, operation),
            dismissOnClick: false
          }
        ] : undefined,
        ...options
      });
    } else {
      console.error(`API Error [${operation}]:`, error);
    }
  }

  // Handle validation errors specifically
  handleValidationError(validationErrors, operation = '', options = {}) {
    if (this.notificationService?.showValidationError) {
      this.notificationService.showValidationError(validationErrors, `Lỗi ${operation}`, options);
    } else {
      console.error(`Validation Error [${operation}]:`, validationErrors);
    }
  }

  // Handle authentication errors
  handleAuthError(error, options = {}) {
    if (this.notificationService?.showAuthError) {
      this.notificationService.showAuthError(error, options);
    } else {
      console.error('Auth Error:', error);
      // Fallback: redirect to login
      localStorage.clear();
      window.location.href = '/login';
    }
  }

  // Handle network errors
  handleNetworkError(error, options = {}) {
    if (this.notificationService?.showNetworkError) {
      this.notificationService.showNetworkError(error, options);
    } else {
      console.error('Network Error:', error);
    }
  }

  // Show detailed error information
  showErrorDetails(error, operation) {
    console.group(`🔍 Chi tiết lỗi: ${operation}`);
    console.error('Error Object:', error);
    console.error('Error Message:', error?.message);
    console.error('Error Status:', error?.status || error?.response?.status);
    console.error('Error Response:', error?.response?.data);
    console.error('Stack Trace:', error?.stack);
    console.groupEnd();
  }

  // Create API wrapper with automatic error handling
  createApiWrapper(apiMethod, operation, options = {}) {
    return async (...args) => {
      try {
        return await apiMethod(...args);
      } catch (error) {
        this.handleApiError(error, operation, options);
        throw error; // Re-throw for component-level handling if needed
      }
    };
  }

  // Batch error handling for multiple operations
  handleBatchErrors(errors, operation = 'thao tác hàng loạt') {
    const groupedErrors = this.groupErrorsByType(errors);
    
    Object.entries(groupedErrors).forEach(([type, errorList]) => {
      const errorMessage = errorList.length === 1 
        ? errorList[0].message 
        : `${errorList.length} lỗi: ${errorList.map(e => e.message).join(', ')}`;
      
      switch (type) {
        case 'auth':
          this.handleAuthError({ message: errorMessage });
          break;
        case 'validation':
          this.handleValidationError(errorList.map(e => e.message), operation);
          break;
        case 'network':
          this.handleNetworkError({ message: errorMessage });
          break;
        default:
          this.handleApiError({ message: errorMessage }, operation);
      }
    });
  }

  // Group errors by type for batch handling
  groupErrorsByType(errors) {
    return errors.reduce((groups, error) => {
      let type = 'api';
      
      if (error.status === 401 || error.status === 403) {
        type = 'auth';
      } else if (error.status === 400) {
        type = 'validation';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        type = 'network';
      }
      
      if (!groups[type]) groups[type] = [];
      groups[type].push(error);
      
      return groups;
    }, {});
  }
}

// Operation-specific error messages
export const OPERATION_MESSAGES = {
  // User Management
  'createUser': 'tạo người dùng',
  'updateUser': 'cập nhật người dùng',
  'deleteUser': 'xóa người dùng',
  'fetchUsers': 'tải danh sách người dùng',
  
  // Doctor Management
  'createDoctor': 'tạo hồ sơ bác sĩ',
  'updateDoctor': 'cập nhật thông tin bác sĩ',
  'deleteDoctor': 'xóa bác sĩ',
  'fetchDoctors': 'tải danh sách bác sĩ',
  'assignSpecialty': 'gán chuyên khoa',
  'removeSpecialty': 'gỡ chuyên khoa',
  
  // Clinic Management
  'createClinic': 'tạo phòng khám',
  'updateClinic': 'cập nhật phòng khám',
  'deleteClinic': 'xóa phòng khám',
  'fetchClinics': 'tải danh sách phòng khám',
  
  // Appointment Management
  'createAppointment': 'tạo lịch hẹn',
  'updateAppointment': 'cập nhật lịch hẹn',
  'deleteAppointment': 'xóa lịch hẹn',
  'fetchAppointments': 'tải danh sách lịch hẹn',
  'confirmAppointment': 'xác nhận lịch hẹn',
  'cancelAppointment': 'hủy lịch hẹn',
  
  // Schedule Management
  'createSlot': 'tạo khung giờ khám',
  'updateSlot': 'cập nhật khung giờ',
  'deleteSlot': 'xóa khung giờ',
  'fetchSlots': 'tải lịch khám',
  'generateSlots': 'tạo lịch tự động',
  
  // Specialty Management
  'createSpecialty': 'tạo chuyên khoa',
  'updateSpecialty': 'cập nhật chuyên khoa',
  'deleteSpecialty': 'xóa chuyên khoa',
  'fetchSpecialties': 'tải danh sách chuyên khoa',
};

// Create singleton instance
let errorHandlerInstance = null;

export const getErrorHandler = (notificationService) => {
  if (!errorHandlerInstance) {
    errorHandlerInstance = new ApiErrorHandler(notificationService);
  }
  return errorHandlerInstance;
};

export default ApiErrorHandler;
