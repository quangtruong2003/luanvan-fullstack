import Menubar from "./components/Menubar"
import ClerkAuthHandler from "./components/ClerkAuthHandler"
import Footer from "./components/Footer"
import N8nChatWidget from "./components/N8nChatWidget"
import { NotificationProvider } from "./components/NotificationSystem"
import { Outlet, useLocation, ScrollRestoration } from "react-router-dom"

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isDashboardPage = location.pathname.startsWith("/admin") || location.pathname.startsWith("/doctor");

  return (
    <NotificationProvider>
      <ScrollRestoration getKey={(location) => location.key} />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <ClerkAuthHandler />
        {!isLoginPage && !isDashboardPage && <Menubar />}
        <main className="flex-grow">
          <Outlet />
        </main>
        {!isLoginPage && !isDashboardPage && <Footer />}
        {/* N8n Chat Widget hiển thị trên tất cả trang trừ login */}
        {!isLoginPage && <N8nChatWidget />}
      </div>
    </NotificationProvider>
  )
}

export default App
