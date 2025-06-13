import { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { authService } from '../services/api'

const ClerkAuthHandler = () => {
  const { isSignedIn, user, isLoaded } = useUser()
  const [syncStatus, setSyncStatus] = useState('idle') // idle, syncing, success, error

  useEffect(() => {
    const syncUserWithBackend = async () => {
      // Chỉ thực hiện khi user đã loaded và đã đăng nhập
      if (!isLoaded || !isSignedIn || !user) {
        console.log('User not loaded or not signed in yet')
        return
      }

      try {
        console.log('User authenticated with Clerk:', user.id)
        setSyncStatus('syncing')

        // Chuẩn bị dữ liệu user để gửi đến backend
        const userData = {
          clerkUserId: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phoneNumber: user.primaryPhoneNumber?.phoneNumber || '',
          imageUrl: user.imageUrl || ''
        }

        console.log('Syncing user with backend:', userData)
        
        // Validation userData trước khi gửi
        if (!userData.clerkUserId) {
          console.error('❌ Missing clerkUserId in userData');
          setSyncStatus('error');
          return;
        }
        
        if (!userData.email) {
          console.error('❌ Missing email in userData');
          setSyncStatus('error');
          return;
        }
        
        // Gọi API để đồng bộ user
        const response = await authService.syncClerkUser(userData)
        console.log('Full API response:', response) // Debug log
        
        // Validation response structure
        if (!response) {
          console.error('❌ API returned null/undefined response');
          setSyncStatus('error');
          return;
        }
        
        // Kiểm tra nếu response có structure đúng
        if (typeof response !== 'object') {
          console.error('❌ API response is not an object:', typeof response, response);
          setSyncStatus('error');
          return;
        }
        
        if (response && response.success) {
          console.log('User synced successfully with backend:', response)
          
          // Kiểm tra và lưu thông tin user vào localStorage một cách an toàn
          if (response.userId != null) {
            localStorage.setItem('backendUserId', String(response.userId))
            console.log('✅ Saved backendUserId:', response.userId);
          } else {
            console.warn('⚠️ API response missing userId field');
          }
          
          // Lưu role từ response hoặc mặc định là PATIENT
          const userRole = response.role || 'PATIENT'
          localStorage.setItem('userRole', userRole)
          console.log('✅ Saved userRole:', userRole);
          
          // Lưu thông tin khác
          if (response.email) {
            localStorage.setItem('userEmail', response.email)
            console.log('✅ Saved userEmail:', response.email);
          }
          if (response.fullName) {
            localStorage.setItem('userName', response.fullName)
            console.log('✅ Saved userName:', response.fullName);
          }
          
          // Lưu JWT token nếu có
          if (response.token) {
            localStorage.setItem('token', response.token)
            console.log('✅ Saved JWT token');
          } else {
            console.warn('⚠️ API response missing token field');
          }
          
          setSyncStatus('success')
        } else {
          console.error('Failed to sync user with backend:', response?.message || 'Unknown error')
          console.error('Response object:', response) // Debug log
          
          // Thêm thông tin debug chi tiết hơn
          console.error('Response success field:', response?.success);
          console.error('Response keys:', response ? Object.keys(response) : 'response is null/undefined');
          
          setSyncStatus('error')
        }
      } catch (error) {
        console.error('Error syncing user with backend:', error)
        setSyncStatus('error')
        
        // Hiển thị lỗi chi tiết hơn để debug
        if (error instanceof Error) {
          console.error('Error details:', error.message)
          if (error.stack) {
            console.error('Error stack:', error.stack)
          }
        }
        
        // Log full error object để debug
        console.error('Full error object:', error)
      }
    }

    // Chạy function đồng bộ mỗi khi user state thay đổi
    syncUserWithBackend()
  }, [isLoaded, isSignedIn, user])

  // Hiển thị thông tin debug khi development
  if (import.meta.env.MODE === 'development') {
    return (
      <div style={{ display: 'none' }}>
        {/* Hidden debug info */}
        <div data-testid="clerk-sync-status">{syncStatus}</div>
        <div data-testid="clerk-user-id">{user?.id || 'no-user'}</div>
      </div>
    )
  }

  // Component này không render gì trong production
  return null
}

export default ClerkAuthHandler 