import React from 'react';
import { 
  Users, Building, Clock, Power, AlertCircle,
  Calendar, CheckCircle, Activity
} from 'lucide-react';

const SpecialtyTabBar = ({ 
  specialties = [], 
  selectedSpecialty, 
  onSpecialtyChange,
  availabilitySlots = [],
  loading = false 
}) => {
  // Get slot counts for a specialty
  const getSlotStats = (specialtyId) => {
    const specialtySlots = availabilitySlots.filter(slot => 
      (slot.specialty_id || slot.specialty?.specialtyId) === specialtyId
    );
    const today = new Date().toISOString().split('T')[0];
    const todaySlots = specialtySlots.filter(slot => slot.date === today);
    
    return {
      total: todaySlots.length,
      available: todaySlots.filter(slot => slot.status === 'AVAILABLE').length,
      booked: todaySlots.filter(slot => slot.status === 'BOOKED').length,
      cancelled: todaySlots.filter(slot => slot.status === 'CANCELLED_BY_CLINIC').length
    };
  };

  // Get status color for specialty tab
  const getTabStatusColor = (specialtyId) => {
    const stats = getSlotStats(specialtyId);
    if (stats.total === 0) return 'border-gray-300 text-gray-500';
    if (stats.available > 0) return 'border-green-500 text-green-700';
    if (stats.booked > 0) return 'border-blue-500 text-blue-700';
    return 'border-gray-400 text-gray-600';
  };

  if (!specialties || specialties.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có chuyên khoa</h3>
          <p className="text-gray-500">
            Vui lòng liên hệ admin để được phân công chuyên khoa và phòng khám.
          </p>
        </div>
      </div>
    );
  }

  // Single specialty - show info card instead of tabs
  if (specialties.length === 1) {
    const specialty = specialties[0];
    const specialtyId = specialty.specialty_id || specialty.specialtyId;
    const stats = getSlotStats(specialtyId);
    
    const specialtyName = specialty.name || 'Chưa có tên';
    const clinicName = specialty.clinic?.name || 'Chưa có phòng khám';
    const clinicAddress = specialty.clinic?.address || '';
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{specialtyName}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Building className="w-4 h-4" />
                <span>{clinicName}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Slots hôm nay</div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">{stats.available}</span>
                <span className="text-gray-500">khả dụng</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium">{stats.booked}</span>
                <span className="text-gray-500">đã đặt</span>
              </div>
            </div>
          </div>
        </div>
        
        {clinicAddress && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Địa chỉ:</span> {clinicAddress}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Multiple specialties - show tab bar
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Tab headers */}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto">
          {specialties.map((specialty) => {
            const specialtyId = specialty.specialty_id || specialty.specialtyId;
            const stats = getSlotStats(specialtyId);
            const isSelected = selectedSpecialty === specialtyId;
            
            const specialtyName = specialty.name || 'Chưa có tên';
            const clinicName = specialty.clinic?.name || 'Chưa có phòng khám';
            
            return (
              <button
                key={specialtyId}
                onClick={() => onSpecialtyChange(specialtyId)}
                disabled={loading}
                className={`relative flex-shrink-0 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2
                  ${isSelected 
                    ? 'border-blue-500 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'}
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center space-x-3">
                  {/* Specialty icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                    ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}
                  `}>
                    <Activity className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  
                  {/* Specialty info */}
                  <div className="text-left">
                    <div className="font-medium">{specialtyName}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Building className="w-3 h-3 mr-1" />
                      {clinicName}
                    </div>
                  </div>
                  
                  {/* Stats badge */}
                  {stats.total > 0 && (
                    <div className="flex flex-col items-center">
                      <div className={`text-xs px-2 py-1 rounded-full font-medium
                        ${stats.available > 0 
                          ? 'bg-green-100 text-green-700' 
                          : stats.booked > 0 
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        {stats.available > 0 ? `${stats.available} khả dụng` : `${stats.total} slots`}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Active indicator */}
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Selected specialty details */}
      {selectedSpecialty && (
        <div className="p-4 bg-gray-50">
          {(() => {
            const selectedSpec = specialties.find(s => (s.specialty_id || s.specialtyId) === selectedSpecialty);
            const stats = getSlotStats(selectedSpecialty);
            
            if (!selectedSpec) return null;
            
            const specialtyName = selectedSpec.name || 'Chưa có tên';
            const clinicName = selectedSpec.clinic?.name || 'Chưa có phòng khám';
            const clinicAddress = selectedSpec.clinic?.address || '';
            
            return (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{specialtyName}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{clinicName}</span>
                      {clinicAddress && (
                        <>
                          <span>•</span>
                          <span className="text-xs">{clinicAddress}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm">
                  {/* Availability stats */}
                  <div className="flex items-center space-x-1">
                    <Power className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-700">{stats.available}</span>
                    <span className="text-gray-500">khả dụng</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-700">{stats.booked}</span>
                    <span className="text-gray-500">đã đặt</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-700">{stats.total}</span>
                    <span className="text-gray-500">tổng cộng</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default SpecialtyTabBar; 