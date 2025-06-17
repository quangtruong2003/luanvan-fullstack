import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UserCircle } from 'lucide-react';
import { apiService } from '../services/api';

const SpecialtyDoctors = () => {
  const { specialtyId } = useParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [specialty, setSpecialty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch specialty info
        const specialtyResponse = await apiService.getSpecialties({ id: specialtyId });
        if (specialtyResponse.content && specialtyResponse.content.length > 0) {
          setSpecialty(specialtyResponse.content[0]);
        }
        
        // Fetch doctors by specialty
        const doctorsResponse = await apiService.getDoctors({ specialtyId });
        setDoctors(doctorsResponse.content || []);
        
      } catch (err) {
        setError('Không thể tải thông tin chuyên khoa');
        console.error('Error fetching specialty doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    if (specialtyId) {
      fetchData();
    }
  }, [specialtyId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {specialty?.name || 'Chuyên khoa'}
          </h1>
          {specialty?.description && (
            <p className="text-gray-600 mt-1">{specialty.description}</p>
          )}
        </div>
      </div>

      {/* Doctors List */}
      {doctors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Không có bác sĩ nào trong chuyên khoa này</p>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách bác sĩ ({doctors.length} bác sĩ)
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">            {doctors.map((doctor) => (
              <Link
                key={doctor.doctorId || doctor.doctor_id}
                to={`/book-appointment/doctor/${doctor.doctorId || doctor.doctor_id}`}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">                  {doctor.profilePictureURL || doctor.profile_picture_url ? (
                    <img
                      src={doctor.profilePictureURL || doctor.profile_picture_url}
                      alt={doctor.user?.fullName || doctor.user?.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-24 h-24 text-gray-400" />
                  )}
                </div>
                
                <div className="p-4">                  <h3 className="font-semibold text-lg text-gray-800">
                    {doctor.user?.fullName || doctor.user?.full_name || 'Bác sĩ'}
                  </h3>
                  
                  {doctor.bio && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {doctor.bio}
                    </p>
                  )}
                    <div className="mt-3 space-y-1">
                    {(doctor.yearsOfExperience || doctor.years_of_experience) && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Kinh nghiệm:</span> {doctor.yearsOfExperience || doctor.years_of_experience} năm
                      </p>
                    )}
                    
                    {(doctor.user?.phoneNumber || doctor.user?.phone_number) && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">SĐT:</span> {doctor.user.phoneNumber || doctor.user.phone_number}
                      </p>
                    )}
                    
                    {doctor.user?.email && (
                      <p className="text-sm text-gray-600 truncate">
                        <span className="font-medium">Email:</span> {doctor.user.email}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {specialty?.name || 'Chuyên khoa'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialtyDoctors; 