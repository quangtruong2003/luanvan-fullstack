import React, { useEffect, useRef } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

const N8nChatWidget = () => {
  //const [isChatVisible, setIsChatVisible] = useState(false); // Thêm trạng thái quản lý hiển thị
  const chatInitialized = useRef(false);
  //const chatContainer = useRef(null);

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
            'Tôi là trợ lý AI của Medical.Care. Tôi có thể giúp gì cho bạn?'
          ],
          
          // Cấu hình i18n
          i18n: {
            en: {
              title: 'Trợ lý Medical.Care 👋',
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
      {/* Nút thu gọn/mở rộng */}
      {/* <button onClick={() => setIsChatVisible(!isChatVisible)}>
        {isChatVisible ? 'Thu gọn' : 'Mở rộng'}
      </button> */}

      {/* Hiển thị widget chat dựa trên trạng thái */}
      {/* {isChatVisible && (
        <div id="n8n-chat" ref={chatContainer}></div>
      )} */}

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

          --chat--textarea--height: auto;
          --chat--textarea--max-height: 120px; /* Giới hạn chiều cao tối đa */

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

        /* ----- Thiết kế lại Input (V5 - Giải pháp cuối cùng) ----- */

        /* Biến form thành một container duy nhất, có style như một input */
        #n8n-chat form {
          position: relative !important;
          display: flex !important;
          align-items: flex-start; /* Căn lề trên để khi textarea cao lên, nút không nhảy */
          padding: 0.5rem !important; /* 8px padding */
          background-color: #f0f4f9 !important; /* Nền xám rất nhạt */
          border-top: 1px solid #e2e8f0 !important;
        }

        /* Wrapper cho textarea và nút bấm, tạo thành khối input chính */
        .chat-input-wrapper {
            position: relative;
            display: flex;
            flex: 1;
            align-items: center;
            background-color: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 9999px; /* Bo tròn hoàn toàn */
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        #n8n-chat form:focus-within .chat-input-wrapper,
        .chat-input-wrapper:focus-within {
             outline: none !important;
             border-color: #3b82f6 !important;
             box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
        }

        /* Ô nhập văn bản - loại bỏ style mặc định */
        #n8n-chat textarea {
          flex: 1 !important;
          width: 100% !important;
          padding: 12px 56px 12px 18px !important; /* Chừa đủ không gian cho nút */
          background-color: transparent !important;
          border: none !important;
          resize: none !important;
          overflow-y: auto !important;
          max-height: 120px !important;
          min-height: 24px !important;
          line-height: 1.5 !important;
          font-size: 1rem !important;
          color: #1e293b !important;
          box-shadow: none !important;
          outline: none !important;
        }

        /* Nút gửi - Đặt bên trong wrapper */
        #n8n-chat form button[type="submit"] {
          position: absolute !important;
          right: 6px !important;
          bottom: 6px !important;
          width: 36px !important;
          height: 36px !important;
          border-radius: 50% !important;
          background-color: #3b82f6 !important;
          border: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: background-color 0.2s, transform 0.1s !important;
          z-index: 5 !important;
        }
        
        #n8n-chat form button[type="submit"]:hover {
          background-color: #2563eb !important;
          transform: scale(1.05);
        }

        /* JS để thêm wrapper (vì không thể sửa JSX) */
        const form = document.querySelector('#n8n-chat form');
        if (form && !form.querySelector('.chat-input-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'chat-input-wrapper';
            
            const textarea = form.querySelector('textarea');
            const button = form.querySelector('button[type="submit"]');

            if (textarea && button) {
                wrapper.appendChild(textarea);
                wrapper.appendChild(button);
                form.appendChild(wrapper);
            }
        }
      `}</style>
    </>
  );
};

export default N8nChatWidget; 