// import { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { Link } from 'react-router-dom';

// const AdminDashboard = () => {
//   const { currentUser, logout } = useAuth();
//   const [stats, setStats] = useState({
//     totalPatients: 0,
//     totalDoctors: 0,
//     totalAppointments: 0,
//     pendingAppointments: 0
//   });

//   // Hiệu ứng nạp thống kê
//   useEffect(() => {
//     // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu thống kê
//     // Giả lập dữ liệu
//     setStats({
//       totalPatients: 156,
//       totalDoctors: 24,
//       totalAppointments: 348,
//       pendingAppointments: 15
//     });
//   }, []);

//   const handleLogout = async () => {
//     await logout();
//     window.location.href = '/login';
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header */}
//       <header className="bg-white shadow">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
//           <h1 className="text-3xl font-bold text-gray-900">
//             Bảng điều khiển quản trị
//           </h1>
//           <div className="flex items-center gap-4">
//             <span className="text-gray-600">
//               Xin chào, {currentUser?.fullName || 'Admin'}
//             </span>
//             <button
//               onClick={handleLogout}
//               className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
//             >
//               Đăng xuất
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {/* Stats */}
//         <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
//           {/* Patients */}
//           <div className="bg-white overflow-hidden shadow rounded-lg">
//             <div className="p-5">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
//                   <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
//                   </svg>
//                 </div>
//                 <div className="ml-5 w-0 flex-1">
//                   <dl>
//                     <dt className="text-sm font-medium text-gray-500 truncate">
//                       Tổng số bệnh nhân
//                     </dt>
//                     <dd>
//                       <div className="text-lg font-medium text-gray-900">
//                         {stats.totalPatients}
//                       </div>
//                     </dd>
//                   </dl>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gray-50 px-5 py-3">
//               <div className="text-sm">
//                 <Link to="/admin/patients" className="font-medium text-blue-700 hover:text-blue-900">
//                   Xem tất cả
//                 </Link>
//               </div>
//             </div>
//           </div>

//           {/* Doctors */}
//           <div className="bg-white overflow-hidden shadow rounded-lg">
//             <div className="p-5">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
//                   <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
//                   </svg>
//                 </div>
//                 <div className="ml-5 w-0 flex-1">
//                   <dl>
//                     <dt className="text-sm font-medium text-gray-500 truncate">
//                       Tổng số bác sĩ
//                     </dt>
//                     <dd>
//                       <div className="text-lg font-medium text-gray-900">
//                         {stats.totalDoctors}
//                       </div>
//                     </dd>
//                   </dl>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gray-50 px-5 py-3">
//               <div className="text-sm">
//                 <Link to="/admin/doctors" className="font-medium text-blue-700 hover:text-blue-900">
//                   Xem tất cả
//                 </Link>
//               </div>
//             </div>
//           </div>

//           {/* Total Appointments */}
//           <div className="bg-white overflow-hidden shadow rounded-lg">
//             <div className="p-5">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
//                   <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
//                   </svg>
//                 </div>
//                 <div className="ml-5 w-0 flex-1">
//                   <dl>
//                     <dt className="text-sm font-medium text-gray-500 truncate">
//                       Tổng số lịch hẹn
//                     </dt>
//                     <dd>
//                       <div className="text-lg font-medium text-gray-900">
//                         {stats.totalAppointments}
//                       </div>
//                     </dd>
//                   </dl>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gray-50 px-5 py-3">
//               <div className="text-sm">
//                 <Link to="/admin/appointments" className="font-medium text-blue-700 hover:text-blue-900">
//                   Xem tất cả
//                 </Link>
//               </div>
//             </div>
//           </div>

//           {/* Pending Appointments */}
//           <div className="bg-white overflow-hidden shadow rounded-lg">
//             <div className="p-5">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
//                   <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                   </svg>
//                 </div>
//                 <div className="ml-5 w-0 flex-1">
//                   <dl>
//                     <dt className="text-sm font-medium text-gray-500 truncate">
//                       Lịch hẹn chờ xác nhận
//                     </dt>
//                     <dd>
//                       <div className="text-lg font-medium text-gray-900">
//                         {stats.pendingAppointments}
//                       </div>
//                     </dd>
//                   </dl>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gray-50 px-5 py-3">
//               <div className="text-sm">
//                 <Link to="/admin/appointments?status=pending" className="font-medium text-blue-700 hover:text-blue-900">
//                   Xem tất cả
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Quick Access */}
//         <div className="bg-white shadow rounded-lg p-6 mb-8">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">Truy cập nhanh</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <Link to="/admin/doctors/new" className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
//               <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
//               </svg>
//               Thêm bác sĩ mới
//             </Link>
//             <Link to="/admin/specialties" className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
//               <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
//               </svg>
//               Quản lý chuyên khoa
//             </Link>
//             <Link to="/admin/reports" className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200">
//               <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
//               </svg>
//               Báo cáo thống kê
//             </Link>
//             <Link to="/admin/settings" className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200">
//               <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
//               </svg>
//               Cài đặt hệ thống
//             </Link>
//           </div>
//         </div>

//         {/* Recent Activity */}
//         <div className="bg-white shadow rounded-lg p-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">Hoạt động gần đây</h2>
//           <div className="flow-root">
//             <ul className="-mb-8">
//               {[1, 2, 3, 4, 5].map((item, index) => (
//                 <li key={index}>
//                   <div className="relative pb-8">
//                     {index !== 4 ? (
//                       <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
//                     ) : null}
//                     <div className="relative flex items-start space-x-3">
//                       <div className="relative">
//                         <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
//                           {index % 2 === 0 ? (
//                             <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
//                             </svg>
//                           ) : (
//                             <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
//                             </svg>
//                           )}
//                         </div>
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <div>
//                           <div className="text-sm font-medium text-gray-900">
//                             {index % 2 === 0 ? 'Bệnh nhân mới đăng ký' : 'Lịch hẹn mới được tạo'}
//                           </div>
//                           <p className="mt-0.5 text-sm text-gray-500">
//                             {index % 2 === 0 ? 'Nguyễn Văn A' : 'Bác sĩ Trần B và bệnh nhân Lê C'}
//                           </p>
//                         </div>
//                         <div className="mt-2 text-sm text-gray-700">
//                           <p>
//                             {index % 2 === 0
//                               ? 'Bệnh nhân mới đã đăng ký tài khoản trên hệ thống.'
//                               : 'Lịch hẹn mới đã được đặt cho ngày 12/06/2023, 14:30.'}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </div>
//           <div className="mt-6">
//             <Link to="/admin/activity" className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
//               Xem tất cả hoạt động
//             </Link>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default AdminDashboard; 