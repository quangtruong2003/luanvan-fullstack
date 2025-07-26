import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, Filter, MapPin, Star, Calendar, Clock, User, 
  Stethoscope, Award, TrendingUp, ArrowRight, Heart,
  ChevronRight, Sparkles, Zap
} from 'lucide-react';
import { apiService } from '../services/api';

const BookAppointment = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedClinic, setSelectedClinic] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [filteredSpecialties, setFilteredSpecialties] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Use Promise.all to fetch concurrently
        const [doctorsResponse, specialtiesResponse, clinicsResponse] = await Promise.all([
          apiService.getDoctors({ page: 0, size: 200 }),
          apiService.getSpecialties(),
          apiService.getClinics()
        ]);
        
        // Process responses
        const allDocs = doctorsResponse.content || doctorsResponse || [];
        const allSpecialties = specialtiesResponse.content || specialtiesResponse || [];
        const allClinics = clinicsResponse.content || clinicsResponse || [];

        setAllDoctors(allDocs);
        setDoctors(allDocs);
        setSpecialties(allSpecialties);
        setFilteredSpecialties(allSpecialties);
        setClinics(allClinics);
        
        // Check for clinicId from URL after initial data is loaded
        const params = new URLSearchParams(location.search);
        const clinicIdFromUrl = params.get('clinicId');
        
        if (clinicIdFromUrl && allClinics.some(c => (c.clinic_id || c.clinicId) == clinicIdFromUrl)) {
          setSelectedClinic(clinicIdFromUrl);
          // Setting the state is async. The filtering logic will be handled by the other useEffect.
        }
        
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
        setIsVisible(true);
      }
    };

    fetchInitialData();
  }, [location.search]);

  useEffect(() => {
    // This effect now correctly depends on the necessary states.
    // It runs when a clinic is selected (either by user or from URL).
    if (selectedClinic) {
        const clinicIdNum = parseInt(selectedClinic);
        const clinic = clinics.find(c => (c.clinic_id === clinicIdNum || c.clinicId === clinicIdNum));
        
        if (clinic) {
            // Logic to filter specialties based on doctors available at the selected clinic.
            const doctorsInClinic = allDoctors.filter(doctor =>
                doctor.specialties?.some(s => s.clinic?.clinic_id === clinicIdNum || s.clinic?.clinicId === clinicIdNum)
            );

            const specialtiesInClinic = doctorsInClinic.flatMap(doctor => doctor.specialties);
            const uniqueSpecialties = Array.from(new Map(specialtiesInClinic.map(spec => [spec.specialty_id || spec.specialtyId, spec])).values());
            
            // Filter out specialties that are not associated with the selected clinic
            const finalSpecialties = uniqueSpecialties.filter(spec => 
                spec.clinic?.clinic_id === clinicIdNum || spec.clinic?.clinicId === clinicIdNum
            );
            
            setFilteredSpecialties(finalSpecialties.length > 0 ? finalSpecialties : []);
        } else {
             setFilteredSpecialties([]);
        }
    } else {
        // If no clinic is selected, show all specialties.
        setFilteredSpecialties(specialties);
    }
    // Reset specialty selection when clinic changes.
    setSelectedSpecialty('');
  }, [selectedClinic, clinics, allDoctors, specialties]);


  const handleFilterAndSearch = () => {
    setLoading(true);
    setSearchPerformed(true);

    let filtered = [...allDoctors];

    // Filter by search query (name)
    if (searchQuery.trim()) {
      const lowercasedQuery = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(doctor =>
        doctor.user?.full_name?.toLowerCase().includes(lowercasedQuery) ||
        doctor.user?.fullName?.toLowerCase().includes(lowercasedQuery)
      );
    }

    // Filter by clinic
    if (selectedClinic) {
      const clinicIdNum = parseInt(selectedClinic);
      filtered = filtered.filter(doctor =>
        doctor.specialties?.some(s => s.clinic?.clinic_id === clinicIdNum || s.clinic?.clinicId === clinicIdNum)
      );
    }

    // Filter by specialty
    if (selectedSpecialty) {
      const specialtyIdNum = parseInt(selectedSpecialty);
      filtered = filtered.filter(doctor =>
        doctor.specialties?.some(s => s.specialty_id === specialtyIdNum || s.specialtyId === specialtyIdNum)
      );
    }

    setDoctors(filtered);
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFilterAndSearch();
    }
  };

  const DoctorCard = ({ doctor }) => (
    <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:scale-105">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Doctor Image */}
      <div className="relative mb-6">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-0.5 group-hover:rotate-6 transition-transform duration-500">
          <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center overflow-hidden">
            <img
              src={doctor.user?.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.user?.full_name || 'Doctor')}&background=3B82F6&color=fff`}
              alt={doctor.user?.full_name}
              className="w-20 h-20 rounded-xl object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.user?.full_name || 'Doctor')}&background=3B82F6&color=fff`;
              }}
            />
          </div>
        </div>
        {/* Experience badge */}
        <div className="absolute -bottom-2 -left-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
          <Award className="w-3 h-3 text-white" />
          <span className="text-xs font-bold text-white">
            {doctor.years_of_experience || doctor.yearsOfExperience || 5}+ năm
          </span>
        </div>
      </div>
      {/* Doctor Info */}
      <div className="text-center mb-6 relative z-10">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
          {doctor.user?.full_name || doctor.user?.fullName || 'Bác sĩ'}
        </h3>
        
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {doctor.specialties?.slice(0, 2).map(specialty => (
            <span
              key={specialty.specialty_id || specialty.specialtyId}
              className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
            >
              {specialty.name}
            </span>
          ))}
          {doctor.specialties?.length > 2 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
              +{doctor.specialties.length - 2} khoa
            </span>
          )}
        </div>
      </div>

      {/* Clinic Info */}
      {doctor.specialties?.[0]?.clinic && (
        <div className="mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-red-500" />
            <span className="font-medium">{doctor.specialties[0].clinic.name}</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <Link
        to={`/book-appointment/doctor/${doctor.doctor_id || doctor.doctorId}`}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group relative overflow-hidden"
      >
        {/* Button background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        
        <Calendar className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
        <span>Đặt lịch ngay</span>
        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
      </Link>
    </div>
  );

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-20 h-20 border-8 border-blue-200 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-20 h-20 border-8 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
        </div>
      </div>
      <p className="text-gray-600 mt-4 font-medium">Đang tìm kiếm bác sĩ tốt nhất cho bạn...</p>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-20">
      <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Stethoscope className="w-16 h-16 text-blue-500" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        {searchPerformed ? 'Không tìm thấy bác sĩ phù hợp' : 'Bắt đầu tìm kiếm bác sĩ'}
      </h3>
      <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
        {searchPerformed 
          ? 'Hãy thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc để tìm được bác sĩ phù hợp nhất.'
          : 'Sử dụng thanh tìm kiếm hoặc chọn chuyên khoa để tìm bác sĩ phù hợp với nhu cầu của bạn.'
        }
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Hero Section */}
      <div className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-transparent"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-xl animate-ping"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {/* Hero Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white/90 text-sm font-medium mb-8">
              <Zap className="w-4 h-4 text-yellow-300" />
              Tìm bác sĩ chuyên khoa hàng đầu
              <ChevronRight className="w-4 h-4" />
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Đặt lịch khám với
              <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
                bác sĩ chuyên nghiệp
              </span>
            </h1>

            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Kết nối với 200+ bác sĩ chuyên khoa hàng đầu. Đặt lịch nhanh chóng, an toàn và tiện lợi.
            </p>

            {/* Search Section */}
            <div className={`max-w-3xl mx-auto transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                <div className="space-y-4">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm bác sĩ theo tên..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-md border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 placeholder-gray-500"
                    />
                  </div>

                  {/* Filters Row */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Clinic Filter */}
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select
                        value={selectedClinic}
                        onChange={(e) => setSelectedClinic(e.target.value)}
                        className="w-full pl-10 pr-8 py-3 bg-white/90 backdrop-blur-md border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm appearance-none cursor-pointer"
                      >
                        <option value="">Tất cả phòng khám</option>
                        {clinics.map(clinic => (
                          <option key={clinic.clinic_id || clinic.clinicId} value={clinic.clinic_id || clinic.clinicId}>
                            {clinic.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  
                    {/* Specialty Filter */}
                    <div className="relative flex-1">
                      <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="w-full pl-10 pr-8 py-3 bg-white/90 backdrop-blur-md border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm appearance-none cursor-pointer"
                      >
                        <option value="">Tất cả chuyên khoa</option>
                        {filteredSpecialties.map(specialty => (
                          <option key={specialty.specialty_id || specialty.specialtyId} value={specialty.specialty_id || specialty.specialtyId}>
                            {specialty.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                    

                  {/* Search Button */}
                  <button
                    onClick={handleFilterAndSearch}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-yellow-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-900/20 border-t-gray-900 rounded-full animate-spin"></div>
                        Đang tìm kiếm...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Tìm bác sĩ phù hợp
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <LoadingSpinner />
        ) : doctors.length > 0 ? (
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {/* Results Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                Bác sĩ chuyên khoa hàng đầu
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Tìm thấy {doctors.length} bác sĩ phù hợp với yêu cầu của bạn
              </p>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {doctors.map((doctor, index) => (
                <div
                  key={doctor.doctor_id || doctor.doctorId}
                  className={`transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <DoctorCard doctor={doctor} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
