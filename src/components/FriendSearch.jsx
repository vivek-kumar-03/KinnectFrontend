import { useState, useEffect, useRef } from "react";
import { Search, UserPlus, Users, X } from "lucide-react";
import { useFriendStore } from "../store/useFriendStore";

const FriendSearch = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef(null);
  
  const { searchResults, isLoading, searchUsers, sendFriendRequest, clearSearchResults } = useFriendStore();

  // Close modal on Escape key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closeModal();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      // Focus the search input when modal opens
      setTimeout(() => {
        const input = document.querySelector("#friend-search-input");
        if (input) input.focus();
      }, 100);
      
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

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 1) {
      searchUsers(query);
    } else {
      clearSearchResults();
    }
  };

  const handleSendRequest = async (userId) => {
    await sendFriendRequest(userId);
    // Close modal after sending request
    setTimeout(() => {
      closeModal();
    }, 500);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSearchQuery("");
    clearSearchResults();
    if (onClose) onClose();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-base-300 rounded-lg transition-colors flex items-center gap-2 min-h-[44px] min-w-[44px]"
        title="Add Friend"
        style={{ backgroundColor: 'var(--surface-hover)' }}
      >
        <UserPlus size={20} />
        <span className="text-sm hidden lg:inline">Add Friend</span>
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
              <h2 className="text-lg font-semibold">Add Friend</h2>
              <button 
                onClick={closeModal} 
                className="p-2 hover:bg-base-300 rounded-full transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
                style={{ backgroundColor: 'var(--surface-hover)' }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: 'var(--text-secondary)' }} />
                <input
                  id="friend-search-input"
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{ 
                    backgroundColor: 'var(--surface-hover)', 
                    color: 'var(--text-primary)', 
                    borderColor: 'var(--border)',
                    borderWidth: '1px'
                  }}
                />
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Enter at least 2 characters to search</p>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="p-2 space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-3 rounded-lg transition-colors"
                      style={{ backgroundColor: 'var(--surface-hover)' }}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-full">
                            <img
                              src={user.profilePic || "/avatar.png"}
                              alt={user.fullName}
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{user.username || user.fullName}</p>
                          <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendRequest(user._id)}
                        className="btn btn-sm flex items-center gap-1 whitespace-nowrap min-h-[36px]"
                        style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                      >
                        <UserPlus size={16} />
                        <span>Add</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : searchQuery && searchQuery.length > 1 ? (
                <div className="flex flex-col items-center justify-center p-8" style={{ color: 'var(--text-secondary)' }}>
                  <Users size={48} className="mb-2" />
                  <p className="text-center">No users found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8" style={{ color: 'var(--text-secondary)' }}>
                  <Search size={48} className="mb-2" />
                  <p className="text-center">Search for users to add as friends</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FriendSearch;