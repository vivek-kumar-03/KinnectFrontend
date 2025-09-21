import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import FriendSearch from "./FriendSearch";
import FriendRequests from "./FriendRequests";
import FriendsList from "./FriendsList";
import { Users } from "lucide-react";

const Sidebar = ({ onClose }) => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, onlineUsers, showOnlineOnly, setShowOnlineOnly } = useChatStore();
  const { friends, getFriends, getFriendRequests } = useFriendStore();

  useEffect(() => {
    getUsers();
    getFriends();
    getFriendRequests();
  }, [getUsers, getFriends, getFriendRequests]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    if (onClose) onClose(); // Close mobile sidebar when user is selected
  };

  // Ensure onlineUsers is an array to prevent errors
  const safeOnlineUsers = Array.isArray(onlineUsers) ? onlineUsers : [];

  // Filter users to show only friends
  const friendIds = new Set(friends.map(friend => friend._id));
  const friendUsers = users.filter(user => friendIds.has(user._id));

  // Apply online filter to friends
  const filteredUsers = showOnlineOnly
    ? friendUsers.filter((user) => safeOnlineUsers.includes(user._id))
    : friendUsers;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full flex flex-col transition-all duration-200 border-r" style={{ width: '20rem', backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="w-full p-4 lg:p-5 backdrop-blur-sm border-b" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Friends</span>
        </div>
        
        {/* Friend Management Buttons - Now visible on all screen sizes */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <FriendSearch onClose={onClose} />
          <FriendRequests onClose={onClose} />
          <FriendsList onClose={onClose} />
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3 custom-scrollbar flex-1" style={{ backgroundColor: 'var(--surface)' }}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => handleUserSelect(user)}
              className={`
                w-full p-3 mx-2 mb-2 flex items-center gap-3 rounded-xl transition-all duration-200
                hover:shadow-md transform hover:-translate-y-0.5 backdrop-blur-sm
              `}
              style={{ 
                backgroundColor: selectedUser?._id === user._id ? 'var(--primary)' : 'var(--surface)',
                boxShadow: selectedUser?._id === user._id ? '0 10px 25px rgba(0, 0, 0, 0.1)' : 'none'
              }}
            >
              <div className="relative">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="w-12 h-12 object-cover rounded-full ring-2 shadow-md"
                  style={{ borderColor: 'var(--border)' }}
                />
                {safeOnlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full ring-2 shadow-sm animate-pulse border-base-300" style={{ backgroundColor: 'var(--success)', borderColor: 'var(--border)' }} />
                )}
              </div>
              <div className="text-left min-w-0 flex-1">
                <div className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.username || user.fullName}</div>
                <div className="text-sm">
                  {safeOnlineUsers.includes(user._id) ? (
                    <span className="flex items-center gap-1" style={{ color: 'var(--success)' }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--success)' }}></span>
                      Online
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>Offline</span>
                  )}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-8 flex-1 flex flex-col items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>No friends found</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Add some friends to start chatting!</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;