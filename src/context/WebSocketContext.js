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
  // Get user and token from AuthContext
  const authContext = useContext(AuthContext);
  
  // Extract user and token safely
  const user = authContext?.user || null;
  const token = authContext?.token || null;
  const authLoading = authContext?.loading || false;

  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const listenersRef = useRef({});
  const isAuthenticatedRef = useRef(false);

  // WebSocket URL - adjust based on environment
  const WS_URL = process.env.REACT_APP_WS_URL || "wss://bookhive-production-9463.up.railway.app/ws";

  // Connect to WebSocket server - useCallback to prevent recreation
  const connect = useCallback(() => {
    // Don't try to connect if already connected or connecting
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      console.log('Creating new WebSocket connection...');
      const websocket = new WebSocket(WS_URL);
      wsRef.current = websocket;
      
      websocket.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        reconnectAttemptsRef.current = 0;
        isAuthenticatedRef.current = false;
        
        // Authenticate if user exists
        if (user && user.id) {
          websocket.send(JSON.stringify({
            type: 'authenticate',
            userId: user.id
          }));
          isAuthenticatedRef.current = true;
        }
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          switch (data.type) {
            case 'authenticated':
              console.log('WebSocket authenticated');
              isAuthenticatedRef.current = true;
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
        console.log('WebSocket disconnected', event.reason);
        setConnected(false);
        wsRef.current = null;
        isAuthenticatedRef.current = false;
        
        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        
        // Attempt to reconnect with exponential backoff, but only if we haven't exceeded max attempts
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          console.log(`Attempting to reconnect in ${timeout}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, timeout);
        } else {
          console.log('Max reconnect attempts reached. Stopping reconnection attempts.');
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        // The onclose handler will be called after this
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [WS_URL, user]);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    // Clear any pending reconnect timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Clear ping interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    // Close WebSocket connection if it exists
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Reset state
    setConnected(false);
    reconnectAttemptsRef.current = 0;
    isAuthenticatedRef.current = false;
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((message) => {
    // Only send messages if WebSocket is connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }, []);

  // Subscribe to events
  const subscribe = useCallback((eventType, callback) => {
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
  }, []);

  // Subscribe to channels
  const subscribeToChannel = useCallback((channel) => {
    sendMessage({
      type: 'subscribe',
      channel: channel
    });
  }, [sendMessage]);

  // Unsubscribe from channels
  const unsubscribeFromChannel = useCallback((channel) => {
    sendMessage({
      type: 'unsubscribe',
      channel: channel
    });
  }, [sendMessage]);

  // Ping server to keep connection alive
  const ping = useCallback(() => {
    sendMessage({ type: 'ping' });
  }, [sendMessage]);

  // Effect to connect when token changes (login/logout)
  useEffect(() => {
    // Only connect after auth loading is complete
    if (authLoading) return;
    
    // Connect to WebSocket
    connect();
    
    // Ping server every 30 seconds to keep connection alive
    pingIntervalRef.current = setInterval(ping, 30000);
    
    // Cleanup function
    return () => {
      // Clear ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      
      // Clear reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Disconnect WebSocket
      disconnect();
    };
  }, [connect, disconnect, ping, authLoading, token]); // Dependency array includes token to reconnect on login/logout

  // Effect to authenticate when user changes but only if not already authenticated
  useEffect(() => {
    // Only authenticate if connected, user exists, and not already authenticated
    if (connected && user && user.id && !isAuthenticatedRef.current) {
      sendMessage({
        type: 'authenticate',
        userId: user.id
      });
      isAuthenticatedRef.current = true;
    }
  }, [connected, user, sendMessage]);

  const value = {
    connected,
    reconnectAttempts: reconnectAttemptsRef.current,
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