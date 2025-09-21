import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { MessageSquare, UserPlus } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);

  // Check if selected user is a friend
  useEffect(() => {
    if (selectedUser && authUser) {
      // Log the structure of friends array for debugging
      console.log("Auth user friends structure:", authUser.friends);
      console.log("Selected user:", selectedUser);
      
      // Handle different possible structures of friends array
      let friendStatus = false;
      
      if (Array.isArray(authUser.friends)) {
        friendStatus = authUser.friends.some(friend => {
          // Handle different possible structures
          if (typeof friend === 'string') {
            return friend === selectedUser._id;
          } else if (friend && typeof friend === 'object') {
            // Check multiple possible properties
            return (friend._id && friend._id === selectedUser._id) || 
                   (friend.id && friend.id === selectedUser._id) ||
                   (friend.toString && friend.toString() === selectedUser._id);
          } else {
            return friend === selectedUser._id;
          }
        });
      }
      
      setIsFriend(friendStatus);
      console.log(`Friend status with ${selectedUser.fullName}:`, friendStatus);
      
      // Also check if this is a pending friend request
      let requestStatus = false;
      if (Array.isArray(authUser.friendRequests)) {
        requestStatus = authUser.friendRequests.some(request => {
          if (typeof request === 'string') {
            return request === selectedUser._id;
          } else if (request && typeof request === 'object') {
            return (request._id && request._id === selectedUser._id) || 
                   (request.id && request.id === selectedUser._id) ||
                   (request.toString && request.toString() === selectedUser._id);
          } else {
            return request === selectedUser._id;
          }
        });
      }
      setFriendRequestSent(requestStatus);
      console.log(`Friend request status with ${selectedUser.fullName}:`, requestStatus);
    }
  }, [selectedUser, authUser]);

  // Re-check friendship status when authUser changes (e.g., after accepting a friend request)
  useEffect(() => {
    if (selectedUser && authUser) {
      // Re-run the friend check logic
      let friendStatus = false;
      
      if (Array.isArray(authUser.friends)) {
        friendStatus = authUser.friends.some(friend => {
          if (typeof friend === 'string') {
            return friend === selectedUser._id;
          } else if (friend && typeof friend === 'object') {
            return (friend._id && friend._id === selectedUser._id) || 
                   (friend.id && friend.id === selectedUser._id) ||
                   (friend.toString && friend.toString() === selectedUser._id);
          } else {
            return friend === selectedUser._id;
          }
        });
      }
      
      setIsFriend(friendStatus);
      console.log(`Re-checked friend status with ${selectedUser.fullName}:`, friendStatus);
    }
  }, [authUser, selectedUser]);

  const handleAddFriend = async () => {
    if (!selectedUser) return;
    
    try {
      await axiosInstance.post(`/friends/send-request/${selectedUser._id}`);
      // Refresh auth user data to update friends list
      const { refreshAuthUser } = useAuthStore.getState();
      await refreshAuthUser();
      // Note: After sending a request, the user is not yet a friend
      // The friend status will update when the request is accepted
      setFriendRequestSent(true);
      toast.success("Friend request sent!");
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error(error.response?.data?.message || "Failed to send friend request");
    }
  };

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);

  // Simple real-time messaging - socket only, no polling
  useEffect(() => {
    if (selectedUser) {
      console.log(`🔊 Setting up real-time messaging for ${selectedUser.fullName}`);
      
      // Only subscribe to real-time messages via socket
      subscribeToMessages();
    }
    
    // Cleanup function
    return () => {
      console.log(`🔇 Unsubscribing from messages for ${selectedUser?.fullName}`);
      //unsubscribeFromMessages();
    };
  }, [selectedUser?._id, subscribeToMessages]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length !== lastMessageCount) {
      console.log(`Message count changed from ${lastMessageCount} to ${messages.length}`);
      setLastMessageCount(messages.length);
      // Use requestAnimationFrame to ensure DOM is updated before scrolling
      requestAnimationFrame(() => {
        if (messageEndRef.current) {
          messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  }, [messages.length, lastMessageCount]);

  // Debug effect to log messages
  useEffect(() => {
    console.log("Messages updated:", messages);
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto h-full w-full" style={{ backgroundColor: 'var(--background)' }}>
        <ChatHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-12 h-12 border-4 border-t-primary border-r-primary border-b-primary border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading messages...</p>
          </div>
        </div>
        <MessageInput />
      </div>
    );
  }

  // Add a safety check to ensure selectedUser exists
  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col overflow-auto h-full w-full" style={{ backgroundColor: 'var(--background)' }}>
        <ChatHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No user selected</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Please select a user to start chatting</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto h-full w-full" style={{ backgroundColor: 'var(--background)' }}>
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {!isFriend && (
          <div className="flex flex-col items-center justify-center h-full p-4" style={{ color: 'var(--text-secondary)' }}>
            <UserPlus className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              {friendRequestSent ? "Friend Request Sent" : "Not Friends Yet"}
            </p>
            <p className="text-sm mb-4 text-center" style={{ color: 'var(--text-secondary)' }}>
              {friendRequestSent 
                ? `Waiting for ${selectedUser.fullName} to accept your friend request.` 
                : `You need to be friends with ${selectedUser.fullName} to send messages.`}
            </p>
            {!friendRequestSent && (
              <button
                onClick={handleAddFriend}
                className="btn px-6 py-2 rounded-full font-medium"
                style={{ backgroundColor: 'var(--primary)', color: 'white' }}
              >
                Add Friend
              </button>
            )}
          </div>
        )}

        {isFriend && messages.map((message) => {
          // Ensure we're correctly identifying sender and receiver
          const isMyMessage = message.senderId === authUser._id || 
                             (message.senderId && message.senderId._id === authUser._id) ||
                             (typeof message.senderId === 'object' && message.senderId.toString() === authUser._id);
          
          // Determine sender info
          let sender = null;
          if (isMyMessage) {
            sender = authUser;
          } else {
            sender = selectedUser;
          }
          
          // Fallback if sender info is missing
          if (!sender) {
            sender = {
              _id: isMyMessage ? authUser._id : selectedUser._id,
              fullName: isMyMessage ? "You" : (selectedUser.fullName || "User"),
              profilePic: isMyMessage ? (authUser.profilePic || "/avatar.png") : (selectedUser.profilePic || "/avatar.png")
            };
          }
          
          return (
            <div
              key={message._id}
              className={`flex gap-3 animate-slide-up ${
                isMyMessage ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={sender.profilePic || "/avatar.png"}
                  alt={sender.fullName || "User"}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover ring-2 shadow-sm"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              
              {/* Message Content */}
              <div className={`flex flex-col max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${
                isMyMessage ? "items-end" : "items-start"
              }`}>
                {/* Username and Time */}
                <div className={`flex items-center gap-2 mb-1 ${
                  isMyMessage ? "flex-row-reverse" : "flex-row"
                }`}>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    {isMyMessage ? "You" : (sender.username || sender.fullName || "User")}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
                
                {/* Message Bubble */}
                <div 
                  className={`relative rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                    isMyMessage 
                      ? "rounded-tr-md" 
                      : "rounded-tl-md"
                  }`}
                  style={{ 
                    backgroundColor: isMyMessage ? 'var(--chat-bubble-me)' : 'var(--chat-bubble-other)',
                    color: isMyMessage ? 'white' : 'var(--text-primary)',
                    borderColor: isMyMessage ? 'var(--primary)' : 'var(--border)'
                  }}
                >
                  {/* Message Image */}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="max-w-full h-auto rounded-xl mb-2 shadow-sm hover:shadow-md transition-shadow duration-200"
                    />
                  )}
                  
                  {/* Message Text */}
                  {message.text && (
                    <p className="text-sm md:text-base leading-relaxed break-words">
                      {message.text}
                    </p>
                  )}
                  
                  {/* Message Tail */}
                  <div className={`absolute top-0 w-3 h-3 ${
                    isMyMessage
                      ? "transform rotate-45 translate-y-2"
                      : "border-l border-t transform rotate-45 translate-y-2"
                  }`}
                  style={{ 
                    backgroundColor: isMyMessage ? 'var(--chat-bubble-me)' : 'var(--chat-bubble-other)',
                    borderColor: isMyMessage ? 'var(--primary)' : 'var(--border)'
                  }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
        
        {isFriend && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--text-secondary)' }}>
            <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No messages yet</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Start the conversation by sending a message!</p>
          </div>
        )}
      </div>

      {isFriend && <MessageInput />}
    </div>
  );
};

export default ChatContainer;