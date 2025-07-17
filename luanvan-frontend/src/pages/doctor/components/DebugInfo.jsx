import React, { useState, useEffect } from 'react';
import { AlertCircle, Info, Eye, EyeOff, RefreshCw, ChevronDown, ChevronUp, User, Building, Award, Shield, Clock } from 'lucide-react';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090/api';

const DebugInfo = ({ show = false, onToggle }) => {
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [loadingDoctorInfo, setLoadingDoctorInfo] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    localStorage: false,
    doctorInfo: false,
    specialties: false,
    apiTest: false
  });

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fetch doctor info on component mount if we're showing the debug panel
  useEffect(() => {
    if (show && !doctorInfo && !loadingDoctorInfo) {
      fetchDoctorInfo();
    }
  }, [show, doctorInfo, loadingDoctorInfo]);

  const testDoctorAPI = async () => {
    setTesting(true);
    setTestResult(null); // Reset test result when starting a new test
    try {
      const backendUserId = localStorage.getItem('backendUserId');
      const token = localStorage.getItem('token');
      
      if (!backendUserId || !token) {
        setTestResult({
          success: false,
          error: 'Missing backendUserId or token in localStorage'
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/doctors/user/${backendUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      setTestResult({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: response.ok ? data : null,
        error: !response.ok ? data : null
      });
      
      // If successful, store doctor info
      if (response.ok && data) {
        setDoctorInfo(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  const fetchDoctorInfo = async () => {
    setLoadingDoctorInfo(true);
    
    try {
      const backendUserId = localStorage.getItem('backendUserId');
      const token = localStorage.getItem('token');
      
      if (!backendUserId || !token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/doctors/user/${backendUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDoctorInfo(data);
        setLastUpdated(new Date());
        console.log("Doctor Info:", data); // Debug log
      }
    } catch (error) {
      console.error('Error fetching doctor info:', error);
    } finally {
      setLoadingDoctorInfo(false);
    }
  };

  // Format date for display
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Chưa cập nhật';
    return lastUpdated.toLocaleTimeString();
  };

  // Reset all data
  const resetAllData = () => {
    setDoctorInfo(null);
    setTestResult(null);
    fetchDoctorInfo();
  };

  if (!show) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 z-50"
        title="Show Debug Info"
      >
        <AlertCircle className="h-4 w-4" />
      </button>
    );
  }

  const localStorage = window.localStorage;
  const debugInfo = {
    backendUserId: localStorage.getItem('backendUserId'),
    token: localStorage.getItem('token'),
    userRole: localStorage.getItem('userRole'),
    userName: localStorage.getItem('userName'),
    userEmail: localStorage.getItem('userEmail'),
    allKeys: Object.keys(localStorage)
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-md max-h-[80vh] overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
          Debug Info
          {lastUpdated && (
            <span className="ml-2 text-xs text-gray-500 font-normal flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatLastUpdated()}
            </span>
          )}
        </h3>
        <div className="flex items-center">
          <button
            onClick={resetAllData}
            className="text-blue-500 hover:text-blue-700 mr-2"
            title="Làm mới tất cả"
            disabled={loadingDoctorInfo}
          >
            <RefreshCw className={`h-4 w-4 ${loadingDoctorInfo ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600"
            title="Đóng"
          >
            <EyeOff className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* localStorage Info */}
      <div className="mb-4 border-b pb-3">
        <div 
          className="flex items-center justify-between mb-2 cursor-pointer"
          onClick={() => toggleSection('localStorage')}
        >
          <h4 className="text-xs font-medium text-gray-700 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            localStorage
          </h4>
          {expandedSections.localStorage ? 
            <ChevronUp className="h-3 w-3 text-gray-500" /> : 
            <ChevronDown className="h-3 w-3 text-gray-500" />
          }
        </div>
        
        {expandedSections.localStorage && (
          <div className="space-y-1 text-xs">
            <div className={`p-2 rounded ${debugInfo.backendUserId ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <strong>User ID:</strong> {debugInfo.backendUserId || 'MISSING'}
            </div>
            <div className={`p-2 rounded ${debugInfo.token ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <strong>Token:</strong> {debugInfo.token ? `${debugInfo.token.substring(0, 20)}...` : 'MISSING'}
            </div>
            <div className={`p-2 rounded ${debugInfo.userRole === 'DOCTOR' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <strong>Role:</strong> {debugInfo.userRole || 'MISSING'}
            </div>
            
            <div className="p-2 bg-gray-50 text-gray-700 rounded">
              <strong>Name:</strong> {debugInfo.userName || 'N/A'}
            </div>
            <div className="p-2 bg-gray-50 text-gray-700 rounded">
              <strong>Email:</strong> {debugInfo.userEmail || 'N/A'}
            </div>
            <div className="p-2 bg-gray-50 text-gray-700 rounded">
              <strong>All Keys:</strong> {debugInfo.allKeys.join(', ')}
            </div>
          </div>
        )}
      </div>

      {/* Doctor Info */}
      <div className="mb-4 border-b pb-3">
        <div 
          className="flex items-center justify-between mb-2 cursor-pointer"
          onClick={() => toggleSection('doctorInfo')}
        >
          <h4 className="text-xs font-medium text-gray-700 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            Thông tin Bác sĩ
          </h4>
          {loadingDoctorInfo ? (
            <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
          ) : (
            <div className="flex items-center">
              {doctorInfo ? (
                <span className="text-xs bg-green-100 text-green-800 px-1 rounded mr-2">
                  Đã kết nối
                </span>
              ) : (
                <span className="text-xs bg-red-100 text-red-800 px-1 rounded mr-2">
                  Chưa kết nối
                </span>
              )}
              {expandedSections.doctorInfo ? 
                <ChevronUp className="h-3 w-3 text-gray-500" /> : 
                <ChevronDown className="h-3 w-3 text-gray-500" />
              }
            </div>
          )}
        </div>
        
        {expandedSections.doctorInfo && (
          <div className="space-y-1 text-xs">
            {loadingDoctorInfo ? (
              <div className="p-2 bg-blue-50 text-blue-800 rounded flex items-center">
                <RefreshCw className="h-3 w-3 animate-spin mr-2" />
                Đang tải thông tin bác sĩ...
              </div>
            ) : doctorInfo ? (
              <>
                <div className="p-2 bg-green-50 text-green-800 rounded flex items-center">
                  <User className="h-3 w-3 mr-2" />
                  <div className="flex items-center justify-between w-full">
                    <span>
                      <strong>Doctor ID:</strong> 
                      <span className="bg-yellow-100 text-yellow-800 px-1 rounded mx-1">
                        {doctorInfo.doctor_id}
                      </span>
                    </span>
                    <span className="bg-blue-500 text-white px-1 text-xs rounded">Bác sĩ</span>
                  </div>
                </div>
                
                <div className="p-2 bg-green-50 text-green-800 rounded">
                  <strong>Bio:</strong> {doctorInfo.bio || 'N/A'}
                </div>
                
                <div className="p-2 bg-green-50 text-green-800 rounded flex items-center">
                  <Award className="h-3 w-3 mr-2" />
                  <div><strong>Kinh nghiệm:</strong> {doctorInfo.years_of_experience || 0} năm</div>
                </div>
                
                {doctorInfo.user && (
                  <div className="p-2 bg-blue-50 text-blue-800 rounded">
                    <div className="font-medium mb-1 flex items-center">
                      <User className="h-3 w-3 mr-2" />
                      Thông tin User:
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <strong>User ID:</strong> 
                        <span className="bg-yellow-100 text-yellow-800 px-1 rounded mx-1">
                          {doctorInfo.user.user_id}
                        </span>
                        {doctorInfo.user.user_id === Number(debugInfo.backendUserId) && (
                          <span className="bg-green-200 text-green-800 text-xs px-1 rounded">
                            Trùng khớp
                          </span>
                        )}
                      </div>
                      <div><strong>Họ tên:</strong> {doctorInfo.user.full_name}</div>
                      <div><strong>Email:</strong> {doctorInfo.user.email}</div>
                      <div><strong>SĐT:</strong> {doctorInfo.user.phone_number || 'N/A'}</div>
                    </div>
                    {doctorInfo.user.image_url && (
                      <div className="mt-1"><strong>Ảnh:</strong> {doctorInfo.user.image_url}</div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="p-2 bg-red-50 text-red-800 rounded">
                Chưa có thông tin bác sĩ. Vui lòng kiểm tra API.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connection Status */}
      <div className="mb-4 border-b pb-3">
        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded text-xs">
          <div className="font-medium">Trạng thái:</div>
          <div className={`px-1 rounded text-center ${doctorInfo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {doctorInfo ? 'Đã kết nối API' : 'Chưa kết nối API'}
          </div>
          
          <div className="font-medium">User ID từ LocalStorage:</div>
          <div className="bg-yellow-100 text-yellow-800 px-1 rounded text-center">
            {debugInfo.backendUserId || 'Không có'}
          </div>
          
          <div className="font-medium">User ID từ API:</div>
          <div className={`px-1 rounded text-center ${doctorInfo?.user ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
            {doctorInfo?.user?.user_id || 'N/A'}
          </div>
          
          <div className="font-medium">Trạng thái khớp:</div>
          <div className={`px-1 rounded text-center ${doctorInfo?.user?.user_id === Number(debugInfo.backendUserId) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {doctorInfo?.user?.user_id === Number(debugInfo.backendUserId) ? 'Trùng khớp' : 'Không khớp'}
          </div>
        </div>
      </div>

      {/* Specialties */}
      <div className="mb-4 border-b pb-3">
        <div 
          className="flex items-center justify-between mb-2 cursor-pointer"
          onClick={() => toggleSection('specialties')}
        >
          <h4 className="text-xs font-medium text-gray-700 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            Chuyên khoa & Phòng khám
          </h4>
          {expandedSections.specialties ? 
            <ChevronUp className="h-3 w-3 text-gray-500" /> : 
            <ChevronDown className="h-3 w-3 text-gray-500" />
          }
        </div>
        
        {expandedSections.specialties && (
          <div className="space-y-1 text-xs">
            {loadingDoctorInfo ? (
              <div className="p-2 bg-blue-50 text-blue-800 rounded flex items-center">
                <RefreshCw className="h-3 w-3 animate-spin mr-2" />
                Đang tải thông tin chuyên khoa...
              </div>
            ) : doctorInfo && doctorInfo.specialties && doctorInfo.specialties.length > 0 ? (
              <>
                <div className="p-2 bg-purple-50 text-purple-800 rounded mb-1 flex items-center">
                  <Shield className="h-3 w-3 mr-2" />
                  <strong>Tổng số chuyên khoa:</strong> {doctorInfo.specialties.length}
                </div>
                {doctorInfo.specialties.map((specialty, index) => (
                  <div key={index} className="mb-2">
                    <div className="p-2 bg-blue-50 text-blue-800 rounded mb-1">
                      <div className="flex justify-between">
                        <div><strong>ID:</strong> {specialty.specialty_id}</div>
                        {specialty.is_primary && (
                          <span className="bg-yellow-400 text-yellow-800 px-1 rounded text-xs">Chuyên khoa chính</span>
                        )}
                      </div>
                      <div><strong>Tên:</strong> {specialty.name}</div>
                      <div><strong>Mô tả:</strong> {specialty.description || 'N/A'}</div>
                    </div>
                    
                    {specialty.clinic && (
                      <div className="ml-2 p-2 bg-green-50 text-green-800 rounded">
                        <div className="font-medium flex items-center">
                          <Building className="h-3 w-3 mr-2" />
                          Phòng khám:
                        </div>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <div><strong>ID:</strong> {specialty.clinic.clinic_id}</div>
                          <div><strong>Tên:</strong> {specialty.clinic.name}</div>
                          <div><strong>SĐT:</strong> {specialty.clinic.phone_number}</div>
                          <div><strong>Email:</strong> {specialty.clinic.email}</div>
                        </div>
                        <div><strong>Địa chỉ:</strong> {specialty.clinic.address}</div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="p-2 bg-red-50 text-red-800 rounded">
                Không tìm thấy chuyên khoa nào cho bác sĩ này.
              </div>
            )}
          </div>
        )}
      </div>

      {/* API Test */}
      <div className="mb-4 border-b pb-3">
        <div 
          className="flex items-center justify-between mb-2 cursor-pointer"
          onClick={() => toggleSection('apiTest')}
        >
          <h4 className="text-xs font-medium text-gray-700 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            Kiểm tra API
          </h4>
          <div className="flex items-center">
            {testResult && (
              <span className={`text-xs mr-2 px-1 rounded ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {testResult.success ? 'OK' : 'Lỗi'}
              </span>
            )}
            {expandedSections.apiTest ? 
              <ChevronUp className="h-3 w-3 text-gray-500 mr-2" /> : 
              <ChevronDown className="h-3 w-3 text-gray-500 mr-2" />
            }
            <button
              onClick={(e) => {
                e.stopPropagation();
                testDoctorAPI();
              }}
              disabled={testing}
              className="flex items-center px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${testing ? 'animate-spin' : ''}`} />
              Test
            </button>
          </div>
        </div>
        
        {expandedSections.apiTest && (
          <div className="text-xs">
            {testing ? (
              <div className="p-2 bg-blue-50 text-blue-800 rounded flex items-center">
                <RefreshCw className="h-3 w-3 animate-spin mr-2" />
                Đang kiểm tra API...
              </div>
            ) : testResult ? (
              <div className={`p-2 rounded ${
                testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {testResult.success ? (
                  <div>
                    <div><strong>✅ Thành công</strong></div>
                    <div>Status: {testResult.status}</div>
                    <div>ID bác sĩ: {testResult.data?.doctor_id}</div>
                    <div>ID người dùng: {testResult.data?.user?.user_id}</div>
                    <div>Họ tên: {testResult.data?.user?.full_name}</div>
                    <div>Số năm kinh nghiệm: {testResult.data?.years_of_experience || 0}</div>
                    <div>Số chuyên khoa: {testResult.data?.specialties?.length || 0}</div>
                    <div className="mt-2">
                      <button
                        onClick={() => setTestResult(null)}
                        className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                      >
                        Xóa kết quả
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div><strong>❌ Thất bại</strong></div>
                    <div>Status: {testResult.status}</div>
                    <div>Lỗi: {testResult.error?.message || JSON.stringify(testResult.error)}</div>
                    <div className="mt-2">
                      <button
                        onClick={() => setTestResult(null)}
                        className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                      >
                        Xóa kết quả
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2 bg-gray-50 text-gray-600 rounded">
                Nhấn nút "Test" để kiểm tra API kết nối đến thông tin bác sĩ.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="w-full px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600"
        >
          Xóa Storage & Quay lại Login
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full px-3 py-2 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Tải lại trang
        </button>
        <button
          onClick={fetchDoctorInfo}
          className="w-full px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${loadingDoctorInfo ? 'animate-spin' : ''}`} />
          Làm mới thông tin bác sĩ
        </button>
      </div>
    </div>
  );
};

export default DebugInfo; 