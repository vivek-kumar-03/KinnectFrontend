import SignUpPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingPage";
import ProfilePage from "./pages/ProfilePage";
import ThemeTestPage from "./pages/ThemeTestPage";
// Removed VerifyEmailPage import
import VerifyOTPPage from "./pages/VerifyOTPPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Navbar from "./components/Navbar";
import TestTheme from "./test-theme";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useChatStore } from "./store/useChatStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { createSocketManager } from "./lib/socketManager"; // Import the factory function
import { ThemeProvider } from "./context/ThemeContext";
import SocketDebug from "./components/SocketDebug";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

// Create a tab-specific socket manager instance
const tabSocketManager = createSocketManager();

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, setSocket, setOnlineUsers } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  // Multi-tab aware socket connection management
  useEffect(() => {
    let socketCleanup;
    
    if (authUser) {
      console.log(`🔗 Connecting socket for user: ${authUser.fullName} (${authUser._id}) in tab ${tabSocketManager.tabId}`);
      // Connect socket for current user using tab-specific socket manager
      const socket = tabSocketManager.connect(BASE_URL, authUser._id);
      setSocket(tabSocketManager);

      // Define event handlers
      const handleOnlineUsers = (userIds) => {
        console.log(`🟢 Online users updated in tab ${tabSocketManager.tabId}:`, userIds);
        setOnlineUsers(userIds);
      };

      // Listen for online users updates across all tabs
      tabSocketManager.on("getOnlineUsers", handleOnlineUsers);

      // Store cleanup function
      socketCleanup = () => {
        tabSocketManager.off("getOnlineUsers", handleOnlineUsers);
      };
    } else {
      console.log(`🔌 Disconnecting socket - user logged out in tab ${tabSocketManager.tabId}`);
      // Disconnect when user logs out
      tabSocketManager.disconnect();
      setSocket(null);
      setOnlineUsers([]);
    }

    // Cleanup function
    return () => {
      if (socketCleanup) {
        socketCleanup();
      }
      // Don't disconnect here - let socketManager handle tab coordination
    };
  }, [authUser, setSocket, setOnlineUsers]);

  if (isCheckingAuth)
    return (
      <div className="flex items-center justify-center h-screen bg-base-100">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium text-base-content">Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen transition-colors duration-300">

      <Navbar />
      <SocketDebug />

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        {/* Removed verify-email route */}
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/forgot-password" element={!authUser ? <ForgotPasswordPage /> : <Navigate to="/" />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/theme-test" element={<TestTheme />} />
        <Route path="/theme-test-page" element={<ThemeTestPage />} />
      </Routes>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'toast-notification',
          style: {
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          },
        }}
      />
    </div>
  );
};

export default App;