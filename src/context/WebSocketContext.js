import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AuthContext from '../auth/AuthContext';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    console.warn('useWebSocket must be used within a WebSocketProvider');
    return {
      connected: false,
      reconnectAttempts: 0,
      sendMessage: () => {},
      subscribe: () => () => {},
      subscribeToChannel: () => {},
      unsubscribeFromChannel: () => {},
      ping: () => {}
    };
  }
  
  return context;
};

export const WebSocketProvider = ({ children }) => {
  // Get user and loading state from AuthContext
  const authContext = useContext(AuthContext);
  
  // Extract user and loading state safely
  const user = authContext?.user || null;
  const authLoading = authContext?.loading || false;

  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const listenersRef = useRef({});

  // WebSocket URL - adjust based on environment
  const WS_URL = process.env.REACT_APP_WS_URL || "wss://bookhive-backend-production.up.railway.app";
  const wsUrl = `${WS_URL}/ws`;

  // Connect to WebSocket server
  const connect = useCallback(() => {
    // Don't try to connect if already connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log('WebSocket connected to:', wsUrl);
        setConnected(true);
        setReconnectAttempts(0);
        wsRef.current = websocket;
        
        // Only authenticate if user exists
        if (user && user.id) {
          websocket.send(JSON.stringify({
            type: 'authenticate',
            userId: user.id
          }));
        }
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          switch (data.type) {
            case 'authenticated':
              console.log('WebSocket authenticated');
              break;
            case 'notification_created':
              // Notify listeners for notifications only if user exists
              if (user && listenersRef.current.notification_created) {
                listenersRef.current.notification_created.forEach(callback => callback(data.data));
              }
              break;
            case 'circle_message':
              // Notify listeners for circle messages only if user exists
              if (user && listenersRef.current.circle_message) {
                listenersRef.current.circle_message.forEach(callback => callback(data.data));
              }
              break;
            case 'story_created':
              // Notify listeners for new stories only if user exists
              if (user && listenersRef.current.story_created) {
                listenersRef.current.story_created.forEach(callback => callback(data.data));
              }
              break;
            case 'resource_updated':
              // Notify listeners for resource updates only if user exists
              if (user && listenersRef.current.resource_updated) {
                listenersRef.current.resource_updated.forEach(callback => callback(data.data));
              }
              break;
            case 'user_activity':
              // Notify listeners for user activity only if user exists
              if (user && listenersRef.current.user_activity) {
                listenersRef.current.user_activity.forEach(callback => callback(data.data));
              }
              break;
            case 'pong':
              // Keep alive response
              break;
            default:
              console.log('Received WebSocket message:', data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocket.onclose = (event) => {
        console.log('WebSocket disconnected');
        setConnected(false);
        wsRef.current = null;
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts < 5) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, timeout);
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [wsUrl, user, reconnectAttempts]);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setConnected(false);
    }
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((message) => {
    // Only send messages if user exists and WebSocket is connected
    if (user && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected or user not authenticated, message not sent:', message);
    }
  }, [user]);

  // Subscribe to events
  const subscribe = useCallback((eventType, callback) => {
    // Only subscribe if user exists
    if (!user) {
      return () => {}; // Return noop unsubscribe function
    }
    
    // Update listeners ref
    if (!listenersRef.current[eventType]) {
      listenersRef.current[eventType] = [];
    }
    listenersRef.current[eventType].push(callback);
    
    // Return unsubscribe function
    return () => {
      if (listenersRef.current[eventType]) {
        listenersRef.current[eventType] = listenersRef.current[eventType].filter(cb => cb !== callback);
      }
    };
  }, [user]);

  // Subscribe to channels
  const subscribeToChannel = useCallback((channel) => {
    // Only subscribe to channels if user exists
    if (user) {
      sendMessage({
        type: 'subscribe',
        channel: channel
      });
    }
  }, [user, sendMessage]);

  // Unsubscribe from channels
  const unsubscribeFromChannel = useCallback((channel) => {
    // Only unsubscribe from channels if user exists
    if (user) {
      sendMessage({
        type: 'unsubscribe',
        channel: channel
      });
    }
  }, [user, sendMessage]);

  // Ping server to keep connection alive
  const ping = useCallback(() => {
    // Only ping if user exists
    if (user) {
      sendMessage({ type: 'ping' });
    }
  }, [user, sendMessage]);

  // Effect to connect when component mounts
  useEffect(() => {
    // Only connect after auth loading is complete
    if (authLoading) return;
    
    connect();
    
    // Ping server every 30 seconds to keep connection alive
    const pingInterval = setInterval(ping, 30000);
    
    return () => {
      clearInterval(pingInterval);
      disconnect();
    };
  }, [connect, disconnect, ping, authLoading]);

  // Effect to authenticate when user changes
  useEffect(() => {
    // Only authenticate if connected and user exists
    if (connected && user && user.id) {
      sendMessage({
        type: 'authenticate',
        userId: user.id
      });
    }
  }, [connected, user, sendMessage]);

  const value = {
    connected,
    reconnectAttempts,
    sendMessage,
    subscribe,
    subscribeToChannel,
    unsubscribeFromChannel,
    ping
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;