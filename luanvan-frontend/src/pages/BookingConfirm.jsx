import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BookingConfirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingInfo = location.state?.bookingInfo;

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: {
      day: '',
      month: '',
      year: ''
    },
    phone: '',
    gender: 'Nam',
    occupation: '',
    idNumber: '',
    email: '',
    ethnicity: 'Kinh',
    province: 'Thành phố Hồ Chí Minh',
    district: '',
    ward: '',
    address: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('dob-')) {
      const field = name.split('-')[1];
      setFormData(prev => ({
        ...prev,
        dateOfBirth: {
          ...prev.dateOfBirth,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Xử lý gửi thông tin đặt lịch
    console.log('Form data:', formData);
    console.log('Booking info:', bookingInfo);
    alert('Đặt lịch thành công!');
    navigate('/my-appointments');
  };

  if (!bookingInfo) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Không tìm thấy thông tin đặt lịch</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Thông tin lịch hẹn</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Bác sĩ:</p>
            <p className="font-medium">{bookingInfo.doctorName}</p>
          </div>
          <div>
            <p className="text-gray-600">Chuyên khoa:</p>
            <p className="font-medium">{bookingInfo.specialty}</p>
          </div>
          <div>
            <p className="text-gray-600">Ngày khám:</p>
            <p className="font-medium">{bookingInfo.date}</p>
          </div>
          <div>
            <p className="text-gray-600">Giờ khám:</p>
            <p className="font-medium">{bookingInfo.time}</p>
          </div>
          <div>
            <p className="text-gray-600">Giá khám:</p>
            <p className="font-medium text-blue-600">{bookingInfo.price}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Thông tin bệnh nhân</h2>
        <div className="space-y-6">
          {/* Họ tên */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên (có dấu) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Ngày sinh và Giới tính */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày tháng năm sinh <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  name="dob-day"
                  placeholder="Ngày"
                  required
                  value={formData.dateOfBirth.day}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="dob-month"
                  placeholder="Tháng"
                  required
                  value={formData.dateOfBirth.month}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="dob-year"
                  placeholder="Năm"
                  required
                  value={formData.dateOfBirth.year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                required
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          {/* Số điện thoại và Nghề nghiệp */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nghề nghiệp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="occupation"
                required
                value={formData.occupation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* CMND và Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số CMND/Passport
              </label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dân tộc và Tỉnh/Thành */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dân tộc
              </label>
              <select
                name="ethnicity"
                value={formData.ethnicity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Kinh">Kinh</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tỉnh/Thành <span className="text-red-500">*</span>
              </label>
              <select
                name="province"
                required
                value={formData.province}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Thành phố Hồ Chí Minh">Thành phố Hồ Chí Minh</option>
                {/* Thêm các tỉnh thành khác */}
              </select>
            </div>
          </div>

          {/* Quận/Huyện và Phường/Xã */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quận/Huyện <span className="text-red-500">*</span>
              </label>
              <select
                name="district"
                required
                value={formData.district}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Chọn Quận/Huyện</option>
                <option value="Bình Chánh">Huyện Bình Chánh</option>
                {/* Thêm các quận huyện khác */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phường/Xã <span className="text-red-500">*</span>
              </label>
              <select
                name="ward"
                required
                value={formData.ward}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Chọn Phường/Xã</option>
                <option value="Bình Hưng">Xã Bình Hưng</option>
                {/* Thêm các phường xã khác */}
              </select>
            </div>
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookingConfirm; 