import { ArrowLeft, X } from "lucide-react";
import { BsCameraVideo, BsTelephone } from 'react-icons/bs';
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { socketManager } from "../lib/socketManager";
import BackButton from "./BackButton";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, startCall } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();

  // Ensure onlineUsers is an array to prevent errors
  const safeOnlineUsers = Array.isArray(onlineUsers) ? onlineUsers : [];

  // Check if selected user is online
  const isUserOnline = safeOnlineUsers.includes(selectedUser?._id);
  
  const handleCall = (type) => {
    if (!selectedUser) {
      toast.error('Please select a user to call');
      return;
    }
    
    if (!authUser) {
      toast.error('Please log in to make calls');
      return;
    }
    
    if (!socketManager.isConnected()) {
      toast.error('Connection issue. Please check your internet.');
      return;
    }
    
    if (!isUserOnline) {
      toast.error(`${selectedUser.username || selectedUser.fullName} is currently offline`);
      return;
    }
    
    console.log(`Starting ${type} call with ${selectedUser.username || selectedUser.fullName}`);
    
    // Start the call in the store
    startCall(type, selectedUser._id, selectedUser.username || selectedUser.fullName);
    
    // Emit call request to the backend
    socketManager.emit("callUser", {
      userToCall: selectedUser._id, 
      signalData: null,
      from: authUser._id,
      type
    });
    
    toast.success(`Calling ${selectedUser.username || selectedUser.fullName}...`);
  };

  const handleGoBack = () => {
    setSelectedUser(null);
  };

  return (
    <div className="p-3 lg:p-4 backdrop-blur-sm border-b" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Back Button */}
          <div className="lg:hidden">
            <BackButton 
              onClick={handleGoBack}
              label="Back"
              showOnDesktop={false}
              className="border transition-colors"
              style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img 
                src={selectedUser.profilePic || "/avatar.png"} 
                alt={selectedUser.fullName} 
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{selectedUser.username || selectedUser.fullName}</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {isUserOnline ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  Online
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  Offline
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <button 
            onClick={() => handleCall('video')} 
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            title="Video call"
          >
            <BsCameraVideo size={20} />
          </button>
          <button 
            onClick={() => handleCall('audio')} 
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            title="Voice call"
          >
            <BsTelephone size={20} />
          </button>
          
          {/* Close button for desktop */}
          <button 
            onClick={handleGoBack}
            className="hidden lg:flex p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            title="Close chat"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;