import { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import ApiService from '../services/api'

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
        
        // Gọi API để đồng bộ user
        const response = await ApiService.syncClerkUser(userData)
        
        if (response.success) {
          console.log('User synced successfully with backend:', response)
          // Lưu thông tin user vào localStorage để sử dụng
          localStorage.setItem('backendUserId', response.userId.toString())
          localStorage.setItem('userRole', 'PATIENT')
          localStorage.setItem('userEmail', response.email || '')
          localStorage.setItem('userName', response.fullName || '')
          setSyncStatus('success')
        } else {
          console.error('Failed to sync user with backend:', response.message)
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
      }
    }

    // Chạy function đồng bộ mỗi khi user state thay đổi
    syncUserWithBackend()
  }, [isLoaded, isSignedIn, user])

  // Hiển thị thông tin debug khi development
  if (process.env.NODE_ENV === 'development') {
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