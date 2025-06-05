// Dữ liệu giả về bác sĩ và lịch khám
export const doctors = [
  {
    id: 1,
    name: "PGS.TS Nguyễn Văn A",
    specialty: "Tim mạch",
    image: "https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg",
    description: "Chuyên gia đầu ngành về tim mạch với hơn 15 năm kinh nghiệm",
    degree: "Phó Giáo sư, Tiến sĩ Y khoa",
    hospital: "Bệnh viện Đại học Y Dược TPHCM",
    rating: 4.9,
    experience: "15 năm",
    price: "500.000 VNĐ",
    schedules: {
      [new Date(Date.now() + 86400000).toISOString().split('T')[0]]: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00", "15:30"],
      [new Date(Date.now() + 2*86400000).toISOString().split('T')[0]]: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00", "15:30"],
      [new Date(Date.now() + 3*86400000).toISOString().split('T')[0]]: ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00", "15:30", "16:00"],
      [new Date(Date.now() + 4*86400000).toISOString().split('T')[0]]: ["08:00", "08:30", "09:00", "09:30", "10:00", "14:00", "14:30", "15:00"],
      [new Date(Date.now() + 5*86400000).toISOString().split('T')[0]]: ["08:00", "08:30", "09:00", "09:30", "14:00", "14:30", "15:00", "15:30", "16:00"]
    }
  },
  {
    id: 2,
    name: "TS.BS Trần Thị B",
    specialty: "Nhi khoa",
    image: "https://img.freepik.com/free-photo/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_1303-29791.jpg",
    description: "Chuyên gia nhi khoa với kinh nghiệm điều trị các bệnh lý về trẻ em",
    degree: "Tiến sĩ Y khoa",
    hospital: "Bệnh viện Nhi Đồng 1",
    rating: 4.8,
    experience: "12 năm",
    price: "450.000 VNĐ",
    schedules: {
      [new Date(Date.now() + 86400000).toISOString().split('T')[0]]: ["08:00", "09:00", "10:00", "14:00"],
      [new Date(Date.now() + 2*86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "14:00", "15:00"],
      [new Date(Date.now() + 3*86400000).toISOString().split('T')[0]]: ["08:00", "09:00", "14:00", "15:00"],
      [new Date(Date.now() + 4*86400000).toISOString().split('T')[0]]: ["08:00", "10:00", "14:00", "15:00"],
      [new Date(Date.now() + 5*86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "14:00", "16:00"]
    }
  },
  {
    id: 3,
    name: "BS.CKI Lê Văn C",
    specialty: "Da liễu",
    image: "https://img.freepik.com/free-photo/portrait-smiling-male-doctor_171337-1532.jpg",
    description: "Chuyên gia về các bệnh lý da liễu và thẩm mỹ da",
    degree: "Bác sĩ Chuyên khoa I",
    hospital: "Bệnh viện Da liễu TPHCM",
    rating: 4.7,
    experience: "10 năm",
    price: "400.000 VNĐ",
    schedules: {
      [new Date(Date.now() + 86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "14:00", "15:00"],
      [new Date(Date.now() + 2*86400000).toISOString().split('T')[0]]: ["08:00", "09:00", "15:00", "16:00"],
      [new Date(Date.now() + 3*86400000).toISOString().split('T')[0]]: ["08:00", "10:00", "14:00", "15:00"],
      [new Date(Date.now() + 4*86400000).toISOString().split('T')[0]]: ["09:00", "10:00", "14:00", "16:00"],
      [new Date(Date.now() + 5*86400000).toISOString().split('T')[0]]: ["08:00", "09:00", "14:00", "15:00"]
    }
  }
];

export const specialties = [
  {
    id: 1,
    name: "Tim mạch",
    image: "https://img.freepik.com/free-photo/heart-care-health-cardiology-heart-disease-concept_53876-125025.jpg",
    description: "Chẩn đoán và điều trị các bệnh về tim mạch",
    doctorCount: 8,
    commonDiseases: ["Tăng huyết áp", "Rối loạn nhịp tim", "Bệnh mạch vành"]
  },
  {
    id: 2,
    name: "Nhi khoa",
    image: "https://img.freepik.com/free-photo/pediatrician-examining-little-girl_23-2148970303.jpg",
    description: "Chăm sóc sức khỏe trẻ em từ sơ sinh đến 15 tuổi",
    doctorCount: 12,
    commonDiseases: ["Viêm phổi", "Tiêu chảy", "Sốt virus"]
  },
  {
    id: 3,
    name: "Da liễu",
    image: "https://img.freepik.com/free-photo/dermatologist-examining-patient-s-skin_23-2148870906.jpg",
    description: "Điều trị các bệnh về da và thẩm mỹ da",
    doctorCount: 6,
    commonDiseases: ["Mụn trứng cá", "Viêm da", "Dị ứng"]
  },
  {
    id: 4,
    name: "Tai Mũi Họng",
    image: "https://img.freepik.com/free-photo/doctor-examining-patient-s-ear_23-2148980376.jpg",
    description: "Chẩn đoán và điều trị các bệnh về tai, mũi, họng",
    doctorCount: 5,
    commonDiseases: ["Viêm xoang", "Viêm amidan", "Viêm tai giữa"]
  },
  {
    id: 5,
    name: "Cơ Xương Khớp",
    image: "https://img.freepik.com/free-photo/physiotherapist-treating-patient-s-back_23-2148980409.jpg",
    description: "Điều trị các bệnh về xương khớp và cơ",
    doctorCount: 7,
    commonDiseases: ["Thoái hóa khớp", "Đau lưng", "Viêm khớp"]
  },
  {
    id: 6,
    name: "Thần kinh",
    image: "https://img.freepik.com/free-photo/doctor-examining-brain-scan_23-2148980498.jpg",
    description: "Chẩn đoán và điều trị các bệnh về hệ thần kinh",
    doctorCount: 4,
    commonDiseases: ["Đau đầu", "Động kinh", "Đột quỵ"]
  }
];

// Dữ liệu về các khung giờ khám
export const timeSlots = {
  morning: ["08:00", "09:00", "10:00", "11:00"],
  afternoon: ["14:00", "15:00", "16:00", "17:00"]
};

// Dữ liệu về giá khám
export const prices = {
  normal: {
    amount: "300.000",
    currency: "VNĐ",
    description: "Khám thường"
  },
  priority: {
    amount: "500.000",
    currency: "VNĐ",
    description: "Khám ưu tiên"
  },
  vip: {
    amount: "1.000.000",
    currency: "VNĐ",
    description: "Khám VIP"
  }
};

// Trạng thái lịch hẹn
export const appointmentStatus = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  COMPLETED: "Đã khám",
  CANCELLED: "Đã hủy"
}; 