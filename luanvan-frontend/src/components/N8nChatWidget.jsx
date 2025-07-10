import React, { useEffect, useRef } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

const N8nChatWidget = () => {
  const chatInitialized = useRef(false);
  const chatContainer = useRef(null);

  useEffect(() => {
    // Chỉ khởi tạo chat một lần
    if (!chatInitialized.current) {
      chatInitialized.current = true;
      
      try {
        createChat({
          // URL webhook n8n của bạn
          webhookUrl: 'https://ebb862.n8nvps.site/webhook/8e4e1d46-5f27-4108-b6fb-ba4e581fc7bc/chat',
          
          // Cấu hình webhook
          webhookConfig: {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          },
          
          // Vị trí hiển thị chat (mặc định: '#n8n-chat')
          target: '#n8n-chat',
          
          // Chế độ hiển thị: 'window' (floating) hoặc 'fullscreen'
          mode: 'window',
          
          // Hiển thị màn hình chào mừng
          showWelcomeScreen: false,
          
          // Key để gửi tin nhắn chat
          chatInputKey: 'chatInput',
          
          // Key để gửi session ID
          chatSessionKey: 'sessionId',
          
          // Tải session trước đó
          loadPreviousSession: true,
          
          // Metadata bổ sung
          metadata: {
            source: 'luanvan-frontend',
            page: window.location.pathname
          },
          
          // Ngôn ngữ mặc định
          defaultLanguage: 'en',
          
          // Tin nhắn khởi tạo
          initialMessages: [
            'Xin chào! 👋',
            'Tôi là trợ lý AI của phòng khám. Tôi có thể giúp gì cho bạn?'
          ],
          
          // Cấu hình i18n
          i18n: {
            en: {
              title: 'Trợ lý phòng khám 👋',
              subtitle: 'Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7',
              footer: '',
              getStarted: 'Bắt đầu cuộc trò chuyện',
              inputPlaceholder: 'Nhập câu hỏi của bạn...',
            }
          }
        });
        
        console.log('N8n chat widget initialized successfully');
      } catch (error) {
        console.error('Error initializing n8n chat widget:', error);
      }
    }
    
    // Cleanup function
    return () => {
      // Không cần cleanup vì n8n chat tự quản lý
    };
  }, []);

  return (
    <>
      {/* Container cho n8n chat widget */}
      <div id="n8n-chat" ref={chatContainer}></div>
      
      {/* CSS customization cho chat widget */}
      <style jsx global>{`
        :root {
          --chat--color-primary: #3b82f6;
          --chat--color-primary-shade-50: #2563eb;
          --chat--color-primary-shade-100: #1d4ed8;
          --chat--color-secondary: #10b981;
          --chat--color-secondary-shade-50: #059669;
          --chat--color-white: #ffffff;
          --chat--color-light: #f8fafc;
          --chat--color-light-shade-50: #f1f5f9;
          --chat--color-light-shade-100: #e2e8f0;
          --chat--color-medium: #cbd5e1;
          --chat--color-dark: #1e293b;
          --chat--color-disabled: #64748b;
          --chat--color-typing: #475569;

          --chat--spacing: 1rem;
          --chat--border-radius: 0.5rem;
          --chat--transition-duration: 0.2s;

          --chat--window--width: 400px;
          --chat--window--height: 600px;

          --chat--header-height: auto;
          --chat--header--padding: var(--chat--spacing);
          --chat--header--background: var(--chat--color-primary);
          --chat--header--color: var(--chat--color-white);
          --chat--header--border-top: none;
          --chat--header--border-bottom: none;
          --chat--heading--font-size: 1.25rem;
          --chat--subtitle--font-size: 0.875rem;
          --chat--subtitle--line-height: 1.5;

          --chat--textarea--height: 50px;

          --chat--message--font-size: 0.875rem;
          --chat--message--padding: 0.75rem;
          --chat--message--border-radius: var(--chat--border-radius);
          --chat--message-line-height: 1.6;
          --chat--message--bot--background: var(--chat--color-white);
          --chat--message--bot--color: var(--chat--color-dark);
          --chat--message--bot--border: 1px solid var(--chat--color-light-shade-100);
          --chat--message--user--background: var(--chat--color-primary);
          --chat--message--user--color: var(--chat--color-white);
          --chat--message--user--border: none;
          --chat--message--pre--background: rgba(0, 0, 0, 0.05);

          --chat--toggle--background: var(--chat--color-primary);
          --chat--toggle--hover--background: var(--chat--color-primary-shade-50);
          --chat--toggle--active--background: var(--chat--color-primary-shade-100);
          --chat--toggle--color: var(--chat--color-white);
          --chat--toggle--size: 60px;
        }
        
        /* Custom styling cho mobile */
        @media (max-width: 768px) {
          :root {
            --chat--window--width: 350px;
            --chat--window--height: 500px;
          }
        }
        
        /* Đảm bảo chat button không bị che bởi footer */
        #n8n-chat {
          z-index: 1000;
        }
      `}</style>
    </>
  );
};

export default N8nChatWidget; 