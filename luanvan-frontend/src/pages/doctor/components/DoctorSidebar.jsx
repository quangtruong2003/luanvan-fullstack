import React from 'react';
import { 
  Home, Calendar, Users, FileText, UserCog, 
  Clock, User, LogOut
} from 'lucide-react';

const DoctorSidebar = ({ 
  activeTab, 
  setActiveTab, 
  stats, 
  availabilitySlots, 
  handleLogout 
}) => {
  const tabs = [
    { id: 'dashboard', name: 'Tổng quan', icon: Home },
    { id: 'appointments', name: 'Lịch hẹn', icon: Calendar },
    { id: 'schedule', name: 'Lịch làm việc', icon: Clock },
    { id: 'patients', name: 'Bệnh nhân', icon: Users },
    { id: 'articles', name: 'Bài viết', icon: FileText },
    { id: 'profile', name: 'Hồ sơ', icon: UserCog }
  ];

  return (
    <div className="w-64 flex-shrink-0">
      <nav className="bg-white shadow-xl rounded-xl p-4 border border-gray-200">
        <div className="mb-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <User className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm font-medium text-gray-700">Bảng điều khiển</p>
        </div>
        
        {/* Navigation Items */}
        <ul className="space-y-2">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isAppointments = tab.id === 'appointments';
            const isSchedule = tab.id === 'schedule';
            
            return (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  title={`${tab.name} (Ctrl+${index + 1})`}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                    activeTab === tab.id
                      ? isAppointments 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                        : isSchedule
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                        : 'bg-blue-100 text-blue-700 shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-md'
                  }`}
                >
                  {isAppointments && activeTab === tab.id && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                  {isSchedule && activeTab === tab.id && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  )}
                  
                  <Icon className={`h-5 w-5 mr-3 ${
                    activeTab === tab.id && (isAppointments || isSchedule) ? 'text-white' : ''
                  }`} />
                  <span className="flex-1 text-left">{tab.name}</span>
                  
                  {/* Highlight for top 2 important tabs */}
                  {index < 3 && (
                    <div className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      isAppointments 
                        ? activeTab === tab.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-red-100 text-red-600'
                        : isSchedule
                        ? activeTab === tab.id
                          ? 'bg-white/20 text-white'
                          : 'bg-green-100 text-green-600'
                        : activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isAppointments ? 'HOT' : isSchedule ? 'NEW' : index === 0 ? 'MAIN' : ''}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        
        {/* Quick Stats in Sidebar */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Thống kê nhanh
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Hôm nay:</span>
              <span className="font-medium text-blue-600">{stats.todayAppointments}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tổng cộng:</span>
              <span className="font-medium text-gray-900">{stats.totalAppointments}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Slots bật:</span>
              <span className="font-medium text-green-600">
                {availabilitySlots.filter(slot => slot.isAvailable).length}
              </span>
            </div>
          </div>
        </div>
        
        {/* Logout Button */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Đăng xuất</span>
          </button>
        </div>
        
        {/* Keyboard Shortcuts Help */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Phím tắt
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Ctrl + 1-6: Chuyển tab</div>
            <div>Ctrl + R: Tải lại</div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default DoctorSidebar;
