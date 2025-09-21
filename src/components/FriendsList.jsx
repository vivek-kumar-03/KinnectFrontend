import { useEffect, useState, useRef } from "react";
import { Users, UserMinus, X, MessageCircle } from "lucide-react";
import { useFriendStore } from "../store/useFriendStore";
import { useChatStore } from "../store/useChatStore";

const FriendsList = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef(null);
  
  const { friends, getFriends, removeFriend } = useFriendStore();
  const { setSelectedUser } = useChatStore();

  // Close modal on Escape key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closeModal();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      
      // Return cleanup function
      return () => {
        document.removeEventListener("keydown", handleEsc);
      };
    }
  }, [isOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        closeModal();
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      
      // Return cleanup function
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, modalRef]);

  useEffect(() => {
    if (isOpen) {
      getFriends();
    }
  }, [isOpen, getFriends]);

  const handleRemoveFriend = async (userId) => {
    if (confirm("Are you sure you want to remove this friend?")) {
      await removeFriend(userId);
    }
  };

  const handleStartChat = (friend) => {
    setSelectedUser(friend);
    closeModal();
  };

  const closeModal = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-base-300 rounded-lg transition-colors flex items-center gap-2"
        title="Friends List"
      >
        <Users size={20} />
        <span className="text-sm hidden lg:inline">Friends</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-start justify-center z-30 p-4" style={{ 
          top: '4rem',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)'
        }}>
          <div 
            ref={modalRef}
            className="bg-white rounded-lg w-full max-w-md max-h-[70vh] flex flex-col shadow-xl mt-4 border"
            style={{ 
              backgroundColor: 'var(--surface)', 
              color: 'var(--text-primary)',
              borderColor: 'var(--border)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-lg font-semibold">
                Friends ({friends.length})
              </h2>
              <button 
                onClick={closeModal} 
                className="p-1 hover:bg-base-300 rounded-full transition-colors"
                style={{ backgroundColor: 'var(--surface-hover)' }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Friends List */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {friends.length > 0 ? (
                <div className="p-2 space-y-2">
                  {friends.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center justify-between p-3 rounded-lg transition-colors"
                      style={{ backgroundColor: 'var(--surface-hover)' }}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-full">
                            <img
                              src={friend.profilePic || "/avatar.png"}
                              alt={friend.fullName}
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{friend.username || friend.fullName}</p>
                          <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{friend.email}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStartChat(friend)}
                          className="btn btn-sm flex items-center gap-1"
                          style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                          title="Start Chat"
                        >
                          <MessageCircle size={16} />
                          <span className="hidden sm:inline">Chat</span>
                        </button>
                        <button
                          onClick={() => handleRemoveFriend(friend._id)}
                          className="btn btn-sm flex items-center gap-1"
                          style={{ backgroundColor: 'var(--error)', color: 'white' }}
                          title="Remove Friend"
                        >
                          <UserMinus size={16} />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8" style={{ color: 'var(--text-secondary)' }}>
                  <Users size={48} className="mb-2" />
                  <p className="text-center">No friends yet</p>
                  <p className="text-sm text-center mt-1">Add some friends to start chatting!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FriendsList;