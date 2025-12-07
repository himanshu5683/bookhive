// backend/services/websocket.js - WebSocket Service for Real-Time Updates

import { WebSocketServer } from 'ws';

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocketServer({
      server,
      path: "/ws"
    });
    this.clients = new Map(); // Map userId to WebSocket connections
    this.initialize();
  }

  initialize() {
    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection established');
      
      // Handle incoming messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          
          // Handle authentication
          if (data.type === 'authenticate') {
            this.authenticateUser(ws, data.userId);
            return;
          }
          
          // Handle other message types
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Invalid message format' 
          }));
        }
      });

      // Handle connection close
      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnect(ws);
      });

      // Send welcome message
      ws.send(JSON.stringify({ 
        type: 'welcome', 
        message: 'Connected to BookHive real-time updates' 
      }));
    });
  }

  authenticateUser(ws, userId) {
    if (!userId) {
      ws.send(JSON.stringify({ 
        type: 'auth_error', 
        message: 'User ID required for authentication' 
      }));
      return;
    }

    // Store the user connection
    this.clients.set(userId, ws);
    
    // Add userId to the WebSocket object for easy access
    ws.userId = userId;
    
    ws.send(JSON.stringify({ 
      type: 'authenticated', 
      message: 'Successfully authenticated',
      userId: userId
    }));
    
    console.log(`User ${userId} authenticated via WebSocket`);
  }

  handleMessage(ws, data) {
    switch (data.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
      case 'subscribe':
        this.subscribeToChannel(ws, data.channel);
        break;
      case 'unsubscribe':
        this.unsubscribeFromChannel(ws, data.channel);
        break;
      default:
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Unknown message type' 
        }));
    }
  }

  subscribeToChannel(ws, channel) {
    if (!ws.channels) {
      ws.channels = new Set();
    }
    ws.channels.add(channel);
    
    ws.send(JSON.stringify({ 
      type: 'subscribed', 
      channel: channel,
      message: `Subscribed to ${channel}`
    }));
  }

  unsubscribeFromChannel(ws, channel) {
    if (ws.channels) {
      ws.channels.delete(channel);
    }
    
    ws.send(JSON.stringify({ 
      type: 'unsubscribed', 
      channel: channel,
      message: `Unsubscribed from ${channel}`
    }));
  }

  handleDisconnect(ws) {
    if (ws.userId) {
      this.clients.delete(ws.userId);
      console.log(`User ${ws.userId} disconnected`);
    }
  }

  // Broadcast to all connected clients
  broadcast(data) {
    const message = JSON.stringify(data);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Send message to a specific user
  sendToUser(userId, data) {
    const ws = this.clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  // Send message to users subscribed to a specific channel
  sendToChannel(channel, data) {
    this.wss.clients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN && 
        client.channels && 
        client.channels.has(channel)
      ) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Notify about new notifications
  sendNotificationUpdate(userId, notification) {
    this.sendToUser(userId, {
      type: 'notification_created',
      data: notification
    });
  }

  // Notify about new messages in study circles
  sendCircleMessage(circleId, message) {
    this.sendToChannel(`circle_${circleId}`, {
      type: 'circle_message',
      data: message
    });
  }

  // Notify about new stories
  sendStoryUpdate(story) {
    this.broadcast({
      type: 'story_created',
      data: story
    });
  }

  // Notify about resource updates
  sendResourceUpdate(resource) {
    this.broadcast({
      type: 'resource_updated',
      data: resource
    });
  }

  // Notify about user activity (credits, achievements, etc.)
  sendUserActivityUpdate(userId, activity) {
    this.sendToUser(userId, {
      type: 'user_activity',
      data: activity
    });
  }

  // Get number of connected clients
  getClientCount() {
    return this.wss.clients.size;
  }

  // Get number of authenticated users
  getAuthenticatedUserCount() {
    return this.clients.size;
  }
}

export default WebSocketService;