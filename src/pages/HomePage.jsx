// src/pages/HomePage.jsx
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import VideoCall from "../components/VideoCall";
import CallIncoming from "../components/CallIncoming";
import { useState, useEffect } from "react";
import { Menu, Users } from "lucide-react";

const HomePage = () => {
  const { selectedUser, call, incomingCall, subscribeToCallEvents } = useChatStore();
  const { authUser } = useAuthStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (authUser) {
      subscribeToCallEvents();
    }
  }, [authUser, subscribeToCallEvents]);

  useEffect(() => {
    // Close mobile sidebar when a user is selected (chat opened)
    if (selectedUser) {
      setIsMobileSidebarOpen(false);
    }
  }, [selectedUser]);

  const handleBackToFriends = () => {
    setIsMobileSidebarOpen(true);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  if (incomingCall) {
    return <CallIncoming call={incomingCall} />;
  }

  if (call) {
    return <VideoCall call={call} />;
  }

  return (
    // push content below navbar
    <div className="h-[calc(100vh-4rem)] w-screen mt-16 overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      <div className="h-full w-full flex">
        <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
          <button
            className={`lg:hidden absolute top-3 left-3 z-10 p-2 rounded-lg shadow-md transition-all duration-200 hover:opacity-90 flex items-center justify-center ${
              selectedUser ? "hidden" : "flex"
            }`}
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: 'var(--primary)',
              color: 'white'
            }}
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Friend Management Bar */}
          {!selectedUser && (
            <div className="lg:hidden absolute top-3 left-16 right-3 z-10 flex justify-center">
              <div className="bg-base-100 rounded-lg shadow-md p-1 flex gap-1" style={{ backgroundColor: 'var(--surface)' }}>
                <button 
                  className="p-2 rounded-md flex flex-col items-center min-w-[60px]"
                  onClick={() => {
                    // This would open the friend search modal
                    const friendSearchBtn = document.querySelector('[title="Add Friend"]');
                    if (friendSearchBtn) friendSearchBtn.click();
                  }}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-xs mt-1">Friends</span>
                </button>
                <button 
                  className="p-2 rounded-md flex flex-col items-center min-w-[60px]"
                  onClick={() => {
                    // This would open the friend requests modal
                    const friendRequestsBtn = document.querySelector('[title="Friend Requests"]');
                    if (friendRequestsBtn) friendRequestsBtn.click();
                  }}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-xs mt-1">Requests</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex h-full rounded-xl md:rounded-2xl overflow-hidden relative">
            {/* Overlay for mobile sidebar */}
            {isMobileSidebarOpen && (
              <div
                className="lg:hidden fixed inset-0 bg-black/50 z-20 backdrop-blur-sm"
                onClick={closeMobileSidebar}
                aria-hidden="true"
              />
            )}

            {/* Sidebar */}
            <div
              className={`lg:relative lg:translate-x-0 lg:w-80 lg:flex-shrink-0 transition-transform duration-300 ease-in-out ${
                isMobileSidebarOpen 
                  ? "fixed inset-y-0 left-0 z-30 w-80 translate-x-0" 
                  : "fixed -translate-x-full lg:translate-x-0"
              }`}
            >
              <Sidebar
                onClose={closeMobileSidebar}
                onBackToFriends={handleBackToFriends}
              />
            </div>

            {/* Main content area */}
            <div
              className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
                selectedUser ? "w-full" : ""
              }`}
              style={{ borderLeft: '1px solid rgba(var(--primary-rgb), 0.2)' }}
            >
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;