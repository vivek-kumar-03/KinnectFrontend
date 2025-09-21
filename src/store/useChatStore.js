import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { createSocketManager } from "../lib/socketManager"; // Import the factory function

// Create a tab-specific socket manager instance for the chat store
const chatSocketManager = createSocketManager();

export const useChatStore = create((set, get) => {
  return {
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  showOnlineOnly: false, // Add this line

  // New state for calling
  call: null,
  incomingCall: null,

  // Add setter function for showOnlineOnly
  setShowOnlineOnly: (showOnlineOnly) => set({ showOnlineOnly }),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      console.log(`Fetched messages for user ${userId}:`, res.data);
      set({ messages: res.data });
    } catch (error) {
      console.error('Error fetching messages:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to load messages";
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        toast.error("You can only message friends. Please add this user as a friend first.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();
    
    console.log(`📤 Sending message to ${selectedUser.fullName}:`, messageData);
    console.log(`👤 Sender user data:`, authUser);
    console.log(`👥 Selected user data:`, selectedUser);
    
    if (!selectedUser || !selectedUser._id) {
      toast.error("No recipient selected");
      throw new Error("No recipient selected");
    }
    
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      const newMessage = res.data;
      
      console.log(`✅ Message sent successfully:`, newMessage);
      
      // Immediately add to local store for instant feedback
      const messageExists = messages.some(msg => msg._id === newMessage._id);
      if (!messageExists) {
        const updatedMessages = [...messages, newMessage];
        set({ messages: updatedMessages });
        console.log(`✅ Message added to local store. Total: ${updatedMessages.length}`);
      }
      
      return newMessage;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        if (error.response.data.notFriend) {
          toast.error("You need to be friends to message this user. Add them as a friend first.");
        } else {
          toast.error("You can only message friends. Please add this user as a friend first.");
        }
      } else if (error.response?.status === 404) {
        toast.error("User not found.");
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.error || "Bad request");
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again.");
      } else {
        toast.error('Failed to send message. Please try again.');
      }
      throw error;
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    console.log('🔌 Subscribing to messages for user:', selectedUser);
    
    if (!selectedUser) {
      console.log('❌ No selected user, skipping subscription');
      return;
    }

    // Ensure socket connection using tab-specific socket manager
    const authUser = useAuthStore.getState().authUser;
    console.log('👤 Current auth user:', authUser);
    
    if (authUser) {
      const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5173" : "/";
      chatSocketManager.connect(BASE_URL, authUser._id);
      
      // Subscribe to events
      chatSocketManager.on('newMessage', get().handleNewMessage);
      
      // Log subscription
      console.log('✅ Subscribed to newMessage events');
    } else {
      console.log('❌ No auth user, skipping subscription');
    }
  },

  subscribeToCallEvents: () => {
    // Subscribe to call events globally (not tied to selected user)
    const authUser = useAuthStore.getState().authUser;
    if (authUser) {
      const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5173" : "/";
      chatSocketManager.connect(BASE_URL, authUser._id);
      
      // Subscribe to call events
      chatSocketManager.on('incomingCall', get().handleIncomingCall);
      chatSocketManager.on('callEnded', get().handleCallEnded);
      chatSocketManager.on('callAccepted', get().handleCallAccepted);
      chatSocketManager.on('callFailed', get().handleCallFailed);
    }
  },

  unsubscribeFromMessages: () => {
    console.log('🔌 Unsubscribing from messages');
    chatSocketManager.off("newMessage", get().handleNewMessage);
    chatSocketManager.off("incomingCall", get().handleIncomingCall);
    chatSocketManager.off("callEnded", get().handleCallEnded);
    chatSocketManager.off("callAccepted", get().handleCallAccepted);
    chatSocketManager.off("callFailed", get().handleCallFailed);
  },

  // Store event handlers as methods so we can properly unsubscribe
  handleNewMessage: (newMessage) => {
    if (!newMessage || !newMessage._id) {
      return;
    }
    
    const { selectedUser, messages } = get();
    const authUser = useAuthStore.getState().authUser;
    
    console.log('📥 New message received:', newMessage);
    console.log('👤 Current user:', authUser?._id);
    console.log('👥 Selected user:', selectedUser?._id);
    
    // If no authenticated user, ignore the message
    if (!authUser) {
      console.log('❌ No authenticated user, ignoring message');
      return;
    }
    
    // Check if this message is intended for the current user
    const isMessageForCurrentUser = 
      (newMessage.receiverId && newMessage.receiverId === authUser._id) || 
      (newMessage.senderId && newMessage.senderId === authUser._id);
    
    console.log('🎯 Is message for current user?', isMessageForCurrentUser);
    
    // If message is not for current user, ignore it
    if (!isMessageForCurrentUser) {
      console.log('❌ Message not for current user, ignoring');
      return;
    }
    
    // If no user is selected or no selected user, just add to store for notification purposes
    if (!selectedUser) {
      console.log('⚠️ No user selected, adding message to general store');
      // Add message if it doesn't exist
      const messageExists = messages.some(msg => msg._id === newMessage._id);
      if (!messageExists) {
        const updatedMessages = [...messages, newMessage];
        set({ messages: updatedMessages });
      }
      return;
    }
    
    // Check if message is for current conversation
    const isForCurrentChat = 
      (newMessage.senderId === selectedUser._id && newMessage.receiverId === authUser._id) ||
      (newMessage.senderId === authUser._id && newMessage.receiverId === selectedUser._id);
    
    console.log('💬 Is message for current chat?', isForCurrentChat);
    
    if (isForCurrentChat) {
      // Add message if it doesn't exist
      const messageExists = messages.some(msg => msg._id === newMessage._id);
      if (!messageExists) {
        const updatedMessages = [...messages, newMessage];
        set({ messages: updatedMessages });
        console.log('✅ Message added to current chat');
      } else {
        console.log('🔄 Message already exists, skipping');
      }
    } else {
      console.log('⏭️ Message not for current chat, skipping');
    }
  },

  handleIncomingCall: ({ from, callerName, callerAvatar, signal, type = 'video' }) => {
    // Use provided caller info from backend, or fallback to lookup
    let finalCallerName = callerName;
    let finalCallerAvatar = callerAvatar;
    
    if (!finalCallerName) {
      const fromUser = get().users.find(user => user._id === from);
      if (fromUser) {
        finalCallerName = fromUser.fullName;
        finalCallerAvatar = fromUser.profilePic;
      } else {
        finalCallerName = 'Unknown User';
        finalCallerAvatar = '/avatar.png';
      }
    }
    
    set({ 
      incomingCall: { 
        from, 
        callerName: finalCallerName,
        callerAvatar: finalCallerAvatar,
        signal,
        type,
        isInitiator: false 
      } 
    });
    
    toast.success(`Incoming ${type} call from ${finalCallerName}`);
  },

  handleCallEnded: () => {
    set({ call: null, incomingCall: null });
    toast.error("Call ended.");
  },

  handleCallAccepted: ({ signal }) => {
    // Handle when the other party accepts the call
    const { call } = get();
    if (call && call.isInitiator) {
      // Continue with the call setup using the signal
      console.log('Call accepted by receiver');
    }
  },

  handleCallFailed: ({ reason }) => {
    set({ call: null, incomingCall: null });
    toast.error(`Call failed: ${reason}`);
  },

  // Call management actions
  startCall: (type, receiverId, receiverName) => {
    const authUser = useAuthStore.getState().authUser;
    set({ 
      call: { 
        type,
        receiverId,
        receiverName,
        isInitiator: true,
        from: authUser._id
      } 
    });
  },
  
  setCall: (callInfo) => set({ call: callInfo }),
  
  acceptCall: ({ from, signal }) => {
    const { incomingCall } = get();
    if (incomingCall) {
      console.log('Accepting call from:', from);
      
      // Set up the call state FIRST
      set({ 
        call: { 
          type: incomingCall.type,
          receiverId: from,
          receiverName: incomingCall.callerName,
          isInitiator: false,
          from: from,
          signal: incomingCall.signal
        },
        incomingCall: null 
      });
      
      toast.success('Call accepted');
    }
  },
  
  rejectCall: ({ from }) => {
    console.log('Rejecting call from:', from);
    console.log('Emitting endCall event to backend');
    chatSocketManager.emit("endCall", { to: from });
    set({ incomingCall: null });
    toast.error("Call rejected.");
  },
  
  endCall: () => {
    set({ call: null, incomingCall: null });
  },

  setSelectedUser: (selectedUser) => {
    console.log('🔄 Setting selected user:', selectedUser);
    
    // Unsubscribe from previous user's messages
    get().unsubscribeFromMessages();
    
    // Set the new selected user
    set({ selectedUser, messages: [] });
    
    // If user is selected, load messages and subscribe
    if (selectedUser) {
      get().getMessages(selectedUser._id);
      // Add a small delay before subscribing to ensure cleanup is complete
      setTimeout(() => {
        get().subscribeToMessages();
      }, 100);
    }
  },

  setMessages: (messages) => set({ messages }),
  }
});