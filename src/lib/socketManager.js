import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnecting = false;
    this.callbacks = new Map();
    this.userId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    // Tab-specific identifier to differentiate socket connections
    this.tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if this user is already connected in another tab
    this.checkExistingConnections();
    
    console.log(`🔧 SocketManager created for tab: ${this.tabId}`);
  }
  
  checkExistingConnections() {
    // Check localStorage for existing connections
    const existingConnections = JSON.parse(localStorage.getItem('activeSocketConnections') || '{}');
    
    // Clean up old connections (older than 30 seconds)
    const now = Date.now();
    Object.keys(existingConnections).forEach(tabId => {
      if (now - existingConnections[tabId].timestamp > 30000) {
        delete existingConnections[tabId];
      }
    });
    
    localStorage.setItem('activeSocketConnections', JSON.stringify(existingConnections));
  }

  connect(baseUrl, userId) {
    if (!userId) {
      console.warn('Cannot connect socket without userId');
      return null;
    }
    
    // Log connection attempt
    console.log(`🔌 Attempting socket connection for user ${userId} in tab ${this.tabId} to ${baseUrl}`);
    
    // If already connected with same user, return existing socket
    if (this.socket?.connected && this.socket.userId === userId) {
      console.log(`🔄 Reusing existing socket connection for user ${userId} in tab ${this.tabId}`);
      return this.socket;
    }
    
    // If connecting with different user, disconnect first
    if (this.socket && this.socket.userId !== userId) {
      console.log(`🔄 Disconnecting socket for different user: ${this.socket.userId} in tab ${this.tabId}`);
      this.disconnect();
    }
    
    if (this.isConnecting) {
      console.log(`⏳ Socket connection already in progress for user ${userId} in tab ${this.tabId}`);
      return null;
    }

    this.isConnecting = true;
    this.userId = userId;
    
    // Register this connection
    const existingConnections = JSON.parse(localStorage.getItem('activeSocketConnections') || '{}');
    existingConnections[this.tabId] = {
      userId,
      timestamp: Date.now(),
      tabId: this.tabId
    };
    localStorage.setItem('activeSocketConnections', JSON.stringify(existingConnections));

    console.log(`🔌 Creating socket connection for user ${userId} in tab ${this.tabId}`);
    this.socket = io(baseUrl, {
      query: { userId, tabId: this.tabId },
      forceNew: true,
      transports: ['websocket', 'polling'],
      timeout: 30000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
      withCredentials: true, // Add credentials support
      rejectUnauthorized: false // For development only, be careful in production
    });
    
    this.socket.userId = userId;
    this.socket.tabId = this.tabId;

    this.socket.on('connect', () => {
      console.log(`✅ Socket connected for user ${userId} in tab ${this.tabId} with socket ID: ${this.socket.id}`);
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      
      // Update connection timestamp
      const connections = JSON.parse(localStorage.getItem('activeSocketConnections') || '{}');
      if (connections[this.tabId]) {
        connections[this.tabId].timestamp = Date.now();
        localStorage.setItem('activeSocketConnections', JSON.stringify(connections));
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`❌ Socket disconnected for user ${userId} in tab ${this.tabId}, reason: ${reason}`);
      
      // If it's a forced disconnection, don't attempt to reconnect
      if (reason === 'io server disconnect') {
        console.log(`🚫 Server forcibly disconnected the socket for user ${userId} in tab ${this.tabId}`);
      } else if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`🔁 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts}) for user ${userId} in tab ${this.tabId}`);
      } else {
        console.log(`⚠️ Max reconnection attempts reached for user ${userId} in tab ${this.tabId}`);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.log(`❌ Socket connection error for user ${userId} in tab ${this.tabId}:`, error.message);
      console.log(`🔧 Connection error details:`, error);
      this.reconnectAttempts++;
      // Only show toast error after multiple failed attempts to avoid spam
      if (this.reconnectAttempts >= 3) {
        toast.error(`Connection error: ${error.message}`);
      }
    });

    // Handle session invalidation
    this.socket.on('sessionInvalidated', (data) => {
      console.log(`🚫 Session invalidated for user ${userId} in tab ${this.tabId}:`, data);
      toast.error("You've been logged out from another tab");
      // Redirect to login page after a delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    });

    // Handle all socket events
    this.socket.onAny((event, ...args) => {
      console.log(`📬 Socket event received in tab ${this.tabId}: ${event}`, args);
      this.emitToCallbacks(event, args.length === 1 ? args[0] : args);
    });

    this.isConnecting = false;
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log(`🔌 Disconnecting socket for user ${this.userId} in tab ${this.tabId}`);
      this.socket.disconnect();
      this.socket = null;
    }
    
    // Remove from active connections
    const connections = JSON.parse(localStorage.getItem('activeSocketConnections') || '{}');
    delete connections[this.tabId];
    localStorage.setItem('activeSocketConnections', JSON.stringify(connections));
    
    this.userId = null;
    this.reconnectAttempts = 0;
  }

  // Emit to local callbacks
  emitToCallbacks(event, data) {
    const callbacks = this.callbacks.get(event) || [];
    console.log(`📤 Emitting callback for event ${event} in tab ${this.tabId}`, data);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`❌ Error in callback for event ${event} in tab ${this.tabId}:`, error);
      }
    });
  }

  // Event listener management
  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);
    
    // Also listen on the actual socket
    if (this.socket) {
      this.socket.on(event, callback);
    }
    console.log(`👂 Subscribed to event ${event} in tab ${this.tabId}`);
  }

  off(event, callback) {
    const callbacks = this.callbacks.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
    
    // Also remove from the actual socket
    if (this.socket) {
      this.socket.off(event, callback);
    }
    console.log(`🔇 Unsubscribed from event ${event} in tab ${this.tabId}`);
  }

  // Emit via socket
  emit(event, data) {
    if (this.socket?.connected) {
      console.log(`📡 Emitting '${event}' via socket in tab ${this.tabId}:`, data);
      this.socket.emit(event, data);
    } else {
      console.warn(`❌ Cannot emit '${event}': socket not connected in tab ${this.tabId}`);
      console.warn('Socket state:', {
        exists: !!this.socket,
        connected: this.socket?.connected,
        userId: this.userId,
        tabId: this.tabId
      });
    }
  }

  // Check if socket is connected
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Instead of exporting a singleton, we'll create a new instance each time
// This ensures each tab has its own socket manager
export const createSocketManager = () => {
  return new SocketManager();
};

// For backward compatibility, we'll keep the singleton but recommend using createSocketManager
export const socketManager = new SocketManager();