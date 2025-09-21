import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { createSocketManager } from "../lib/socketManager"; // Import the factory function

// Create a tab-specific socket manager instance for the auth store
const authSocketManager = createSocketManager();

// Generate unique tab ID
const TAB_ID = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper function to get tab-specific auth data from sessionStorage
const getTabAuthUser = () => {
  try {
    const item = sessionStorage.getItem('authUser');
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error getting tab auth user:', error);
    return null;
  }
};

// Helper function to set tab-specific auth data to sessionStorage
const setTabAuthUser = (user) => {
  try {
    if (user) {
      sessionStorage.setItem('authUser', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('authUser');
    }
  } catch (error) {
    console.error('Error setting tab auth user:', error);
  }
};

// Simplified function to manage user session (without multi-tab support)
const updateUserSession = (user, action = 'add') => {
  try {
    if (action === 'add' && user) {
      // Store user session data
      const session = {
        userId: user._id,
        userName: user.fullName,
        profilePic: user.profilePic,
        loginTime: Date.now(),
        lastActivity: Date.now()
      };
      localStorage.setItem('userSession', JSON.stringify(session));
    } else if (action === 'remove') {
      localStorage.removeItem('userSession');
    } else if (action === 'updateActivity' && user) {
      const session = JSON.parse(localStorage.getItem('userSession') || '{}');
      if (session.userId) {
        session.lastActivity = Date.now();
        localStorage.setItem('userSession', JSON.stringify(session));
      }
    }
  } catch (error) {
    console.error('Error updating user session:', error);
  }
};

// Helper function to sync online users
const syncOnlineUsers = (userIds) => {
  try {
    localStorage.setItem('onlineUsers', JSON.stringify(userIds || []));
  } catch (error) {
    console.error('Error syncing online users:', error);
  }
};

// Helper function to get synced online users
const getSyncedOnlineUsers = () => {
  try {
    const item = localStorage.getItem('onlineUsers');
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error('Error getting synced online users:', error);
    return [];
  }
};

export const useAuthStore = create((set, get) => {
  // Initialize with tab-specific auth user from sessionStorage
  const initialAuthUser = getTabAuthUser();
  
  // Initialize user session tracking
  if (initialAuthUser) {
    updateUserSession(initialAuthUser, 'add');
  }
  
  // Listen for storage changes to sync data
  const handleStorageChange = (event) => {
    if (event.key === 'onlineUsers') {
      try {
        const newValue = event.newValue ? JSON.parse(event.newValue) : [];
        set({ onlineUsers: newValue });
      } catch (error) {
        console.error('Error parsing online users from storage:', error);
      }
    }
    // Check for same user login in different tabs
    else if (event.key === 'authUser' && event.newValue) {
      const currentUser = get().authUser;
      const newUser = JSON.parse(event.newValue);
      
      if (currentUser && newUser && currentUser._id === newUser._id && currentUser.sessionId !== newUser.sessionId) {
        // Same user logged in with different session - logout this tab
        set({ authUser: null });
        setTabAuthUser(null);
        toast.error("You have been logged out because you logged in from another tab.");
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    }
  };
  
  // Add storage event listener
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageChange);
    
    // Handle tab close/refresh
    window.addEventListener('beforeunload', () => {
      updateUserSession(null, 'remove');
    });
    
    // Update activity periodically
    const activityInterval = setInterval(() => {
      const currentUser = get().authUser;
      if (currentUser) {
        updateUserSession(currentUser, 'updateActivity');
      }
    }, 30000); // Every 30 seconds
    
    // Cleanup interval on unmount (this won't work in practice, but good practice)
    if (typeof window !== 'undefined') {
      window.authStoreCleanup = () => clearInterval(activityInterval);
    }
  }
  
  return {
  authUser: initialAuthUser,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: getSyncedOnlineUsers(),
  // Removed activeUserSessions and tabId since we're not using multi-tab functionality
  socket: null, // Keep socket state here, but don't manage connection here

  // Add setter function
  set: (state) => set(state),

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      const user = res.data;
      console.log("User data received from checkAuth:", user);
      console.log("User friends:", user.friends);
      set({ authUser: user });
      setTabAuthUser(user);
      updateUserSession(user, 'add');
    } catch (error) {
      console.log("Error in checkAuth:", error);
      
      // Check if session was invalidated
      if (error.response?.data?.sessionInvalidated) {
        console.log("Session was invalidated");
        // Don't show error toast for session invalidation
      }
      
      set({ authUser: null });
      setTabAuthUser(null);
      updateUserSession(null, 'remove');
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  refreshAuthUser: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      const user = res.data;
      console.log("Refreshing user data:", user);
      set({ authUser: user });
      setTabAuthUser(user);
      updateUserSession(user, 'add');
      
      // Also update in localStorage for other tabs
      if (typeof window !== 'undefined' && user) {
        try {
          localStorage.setItem('authUser', JSON.stringify(user));
        } catch (e) {
          console.error('Error saving auth user to localStorage:', e);
        }
      }
      
      return user;
    } catch (error) {
      console.log("Error refreshing auth user:", error);
      return null;
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      toast.success(res.data.message);
      return { success: true, requiresOTP: res.data.requiresOTP, email: res.data.email };
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      return { success: false };
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      const user = res.data;
      
      set({ authUser: user });
      setTabAuthUser(user);
      updateUserSession(user, 'add');
      
      toast.success("Logged in successfully!");
      return { success: true, user };
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      return { success: false };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      
      set({ authUser: null, onlineUsers: [] });
      setTabAuthUser(null);
      updateUserSession(null, 'remove');
      syncOnlineUsers([]);
      toast.success("Logged out successfully");
      
      // Disconnect socket on logout
      const currentSocket = get().socket;
      if (currentSocket) {
        currentSocket.disconnect();
      }
      authSocketManager.disconnect();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      const user = res.data;
      set({ authUser: user });
      setTabAuthUser(user);
      updateUserSession(user, 'add');
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  
  // These functions are now handled in App.jsx
  setSocket: (socketManager) => set({ socket: socketManager }),
  setOnlineUsers: (userIds) => {
    // Ensure userIds is always an array
    const safeUserIds = Array.isArray(userIds) ? userIds : [];
    set({ onlineUsers: safeUserIds });
    syncOnlineUsers(safeUserIds);
  },
  
  // Removed multi-tab specific functions


  // Cleanup function for removing event listeners
  cleanup: () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageChange);
      if (window.authStoreCleanup) {
        window.authStoreCleanup();
      }
    }
    updateUserSession(null, 'remove');
  }
  };
});