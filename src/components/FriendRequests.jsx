import { useEffect, useState, useRef } from "react";
import { Check, X, Users } from "lucide-react";
import { useFriendStore } from "../store/useFriendStore";

const FriendRequests = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef(null);
  
  const { 
    friendRequests, 
    getFriendRequests, 
    acceptFriendRequest, 
    declineFriendRequest 
  } = useFriendStore();

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
      getFriendRequests();
    }
  }, [isOpen, getFriendRequests]);

  const handleAccept = async (userId) => {
    await acceptFriendRequest(userId);
  };

  const handleDecline = async (userId) => {
    await declineFriendRequest(userId);
  };

  const closeModal = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 hover:bg-base-300 rounded-lg transition-colors flex items-center gap-2 min-h-[44px] min-w-[44px]"
        title="Friend Requests"
        style={{ backgroundColor: 'var(--surface-hover)' }}
      >
        <Users size={20} />
        <span className="text-sm hidden lg:inline">Requests</span>
        {friendRequests.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-error text-error-content text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {friendRequests.length}
          </span>
        )}
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
                Friend Requests ({friendRequests.length})
              </h2>
              <button 
                onClick={closeModal} 
                className="p-2 hover:bg-base-300 rounded-full transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
                style={{ backgroundColor: 'var(--surface-hover)' }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Friend Requests List */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {friendRequests.length > 0 ? (
                <div className="p-2 space-y-2">
                  {friendRequests.map((request) => (
                    <div
                      key={request._id}
                      className="flex items-center justify-between p-3 rounded-lg transition-colors flex-wrap gap-2"
                      style={{ backgroundColor: 'var(--surface-hover)' }}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-full">
                            <img
                              src={request.profilePic || "/avatar.png"}
                              alt={request.fullName}
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{request.username || request.fullName}</p>
                          <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{request.email}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAccept(request._id)}
                          className="btn btn-sm flex items-center gap-1 min-h-[36px]"
                          style={{ backgroundColor: 'var(--success)', color: 'white' }}
                          title="Accept"
                        >
                          <Check size={16} />
                          <span className="hidden sm:inline">Accept</span>
                        </button>
                        <button
                          onClick={() => handleDecline(request._id)}
                          className="btn btn-sm flex items-center gap-1 min-h-[36px]"
                          style={{ backgroundColor: 'var(--error)', color: 'white' }}
                          title="Decline"
                        >
                          <X size={16} />
                          <span className="hidden sm:inline">Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8" style={{ color: 'var(--text-secondary)' }}>
                  <Users size={48} className="mb-2" />
                  <p className="text-center">No friend requests</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FriendRequests;