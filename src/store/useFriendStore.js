import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore"; // Import auth store

// Debounce timer reference
let searchDebounceTimer = null;

export const useFriendStore = create((set, get) => ({
  friends: [],
  friendRequests: [],
  searchResults: [],
  isLoading: false,

  // Search users with debounce
  searchUsers: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    
    // Clear previous debounce timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    
    // Set loading state immediately for better UX
    set({ isLoading: true });
    
    // Debounce search requests
    searchDebounceTimer = setTimeout(async () => {
      try {
        const response = await axiosInstance.get(`/friends/search?query=${encodeURIComponent(query)}`);
        set({ searchResults: response.data });
      } catch (error) {
        console.error("Error searching users:", error);
        toast.error("Error searching users");
        set({ searchResults: [] });
      } finally {
        set({ isLoading: false });
      }
    }, 300); // 300ms debounce
  },

  // Send friend request
  sendFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/friends/request/${userId}`);
      toast.success("Friend request sent");
      
      // Remove from search results
      const { searchResults } = get();
      set({ 
        searchResults: searchResults.filter(user => user._id !== userId) 
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error(error.response?.data?.message || "Error sending friend request");
    }
  },

  // Accept friend request
  acceptFriendRequest: async (userId) => {
    try {
      const response = await axiosInstance.post(`/friends/accept/${userId}`);
      toast.success("Friend request accepted");
      
      // Move from friend requests to friends
      const { friendRequests, friends } = get();
      const acceptedFriend = friendRequests.find(req => req._id === userId);
      
      set({
        friendRequests: friendRequests.filter(req => req._id !== userId),
        friends: acceptedFriend ? [...friends, acceptedFriend] : friends
      });
      
      // Refresh auth user to get updated friends list
      const updatedUser = await useAuthStore.getState().refreshAuthUser();
      
      // If the response contains updated user data, use it
      if (response.data.currentUser) {
        useAuthStore.getState().set({ authUser: response.data.currentUser });
      } else if (updatedUser) {
        // Make sure the friends list is properly updated
        console.log("Updated user from refresh:", updatedUser);
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error(error.response?.data?.message || "Error accepting friend request");
    }
  },

  // Decline friend request
  declineFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/friends/decline/${userId}`);
      toast.success("Friend request declined");
      
      const { friendRequests } = get();
      set({
        friendRequests: friendRequests.filter(req => req._id !== userId)
      });
    } catch (error) {
      console.error("Error declining friend request:", error);
      toast.error(error.response?.data?.message || "Error declining friend request");
    }
  },

  // Remove friend
  removeFriend: async (userId) => {
    try {
      await axiosInstance.delete(`/friends/${userId}`);
      toast.success("Friend removed");
      
      const { friends } = get();
      set({
        friends: friends.filter(friend => friend._id !== userId)
      });
      
      // Refresh auth user to get updated friends list
      await useAuthStore.getState().refreshAuthUser();
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error(error.response?.data?.message || "Error removing friend");
    }
  },

  // Get friends list
  getFriends: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get("/friends");
      set({ friends: response.data });
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast.error("Error fetching friends");
    } finally {
      set({ isLoading: false });
    }
  },

  // Get friend requests
  getFriendRequests: async () => {
    try {
      const response = await axiosInstance.get("/friends/requests");
      set({ friendRequests: response.data });
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      toast.error("Error fetching friend requests");
    }
  },

  // Clear search results
  clearSearchResults: () => {
    // Clear debounce timer when clearing results
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    set({ searchResults: [], isLoading: false });
  },
}));