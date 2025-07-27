import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { NotificationsService } from './notifications.service.js';
import { UserRole } from '../users/user.entity.js';

@Injectable()
@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001', 
      'https://localhost:3000',
      'https://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['*'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
export class NotificationsWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsWebSocketGateway.name);
  private connectedUsers = new Map<string, Socket>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  onModuleInit() {
    // Set up circular dependency
    this.notificationsService.setWebSocketGateway(this);
  }

  afterInit(server: Server) {
    this.logger.log('🚀 WebSocket Gateway initialized successfully');
    this.logger.log(`🔗 Socket.IO server running on namespace: /notifications`);
    this.logger.log(`🌍 CORS origins allowed: ${JSON.stringify([
      'http://localhost:3000',
      'http://localhost:3001', 
      'https://localhost:3000',
      'https://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ])}`);
  }

  async handleConnection(client: Socket) {
    // Log connection attempt FIRST, before any authentication
    this.logger.log(`🔗 RAW connection attempt received! Client ID: ${client.id}`);
    this.logger.log(`📡 Connection from IP: ${client.handshake.address}`);
    this.logger.log(`🌐 Origin: ${client.handshake.headers.origin}`);
    
    try {
      this.logger.log(`🔗 WebSocket connection attempt from ${client.handshake.address}`);
      this.logger.debug(`📋 Connection details:`, {
        origin: client.handshake.headers.origin,
        userAgent: client.handshake.headers['user-agent']?.substring(0, 50),
        transport: client.conn.transport.name,
        query: client.handshake.query,
        auth: client.handshake.auth ? 'Present' : 'Missing'
      });
      
      // Extract token from multiple sources
      const token = 
        client.handshake.query.token as string || 
        client.handshake.auth?.token as string ||
        client.handshake.headers.authorization?.replace('Bearer ', '') ||
        client.handshake.headers.authorization;

      this.logger.log(`🔐 Token extraction: ${token ? 'Token found' : 'No token found'}`);

      if (!token) {
        this.logger.warn('❌ Client connection rejected: No token provided', {
          query: Object.keys(client.handshake.query),
          auth: client.handshake.auth ? 'Present' : 'Missing',
          headers: Object.keys(client.handshake.headers),
        });
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      // Verify JWT token with better error handling
      let payload;
      try {
        payload = this.jwtService.verify(token);
        this.logger.log(`✅ JWT verification successful for user ${payload.sub}`);
      } catch (jwtError) {
        this.logger.warn('❌ JWT verification failed:', jwtError.message);
        client.emit('error', { message: 'Invalid or expired token' });
        client.disconnect();
        return;
      }

      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        this.logger.warn(`❌ Client connection rejected: User not found for ID ${payload.sub}`);
        client.emit('error', { message: 'User not found' });
        client.disconnect();
        return;
      }

      // Store user info in client data
      (client as any).userId = user.id.toString();
      (client as any).user = user;

      // Add to connected users map
      this.connectedUsers.set(user.id.toString(), client);

      // Join user-specific room
      client.join(`user_${user.id}`);

      // Join admin room if user is admin
      if (user.role === UserRole.ADMIN) {
        client.join('admin');
      }

      this.logger.log(`🎉 User ${user.id} (${user.email}) connected to notifications WebSocket`);

      // Send connection confirmation
      client.emit('connected', {
        message: 'Connected to notifications',
        userId: user.id,
      });

      // Send initial unread count
      const unreadCount = await this.notificationsService.getUnreadCount(user.id);
      client.emit('unread_count', { count: unreadCount });

    } catch (error) {
      this.logger.error('💥 Error during WebSocket connection:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      this.logger.log(`User ${userId} disconnected from notifications WebSocket`);
    }
  }

  @SubscribeMessage('join_notifications')
  handleJoinNotifications(@ConnectedSocket() client: Socket) {
    const userId = (client as any).userId;
    if (userId) {
      client.join(`user_${userId}`);
      client.emit('joined', { room: `user_${userId}` });
    }
  }

  @SubscribeMessage('get_unread_count')
  async handleGetUnreadCount(@ConnectedSocket() client: Socket) {
    const userId = (client as any).userId;
    if (userId) {
      const count = await this.notificationsService.getUnreadCount(parseInt(userId));
      client.emit('unread_count', { count });
    }
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = (client as any).userId;
    if (userId) {
      try {
        await this.notificationsService.markAsRead(data.notificationId, parseInt(userId));
        client.emit('notification_read', { notificationId: data.notificationId });
        
        // Send updated unread count
        const unreadCount = await this.notificationsService.getUnreadCount(parseInt(userId));
        client.emit('unread_count', { count: unreadCount });
      } catch (error) {
        client.emit('error', { message: 'Failed to mark notification as read' });
      }
    }
  }

  @SubscribeMessage('mark_all_as_read')
  async handleMarkAllAsRead(@ConnectedSocket() client: Socket) {
    const userId = (client as any).userId;
    if (userId) {
      try {
        await this.notificationsService.markAllAsRead(parseInt(userId));
        client.emit('bulk_read', { userId: userId });
        client.emit('unread_count', { count: 0 });
      } catch (error) {
        client.emit('error', { message: 'Failed to mark all notifications as read' });
      }
    }
  }

  // Methods to be called by services when notifications are created/updated
  async notifyUser(userId: string, notification: any) {
    const userRoom = `user_${userId}`;
    this.server.to(userRoom).emit('notification_created', {
      notification,
      type: 'notification_created',
    });

    // Also update unread count
    const unreadCount = await this.notificationsService.getUnreadCount(parseInt(userId));
    this.server.to(userRoom).emit('unread_count', { count: unreadCount });
  }

  async notifyAllUsers(notification: any) {
    this.server.emit('notification_created', {
      notification,
      type: 'notification_created',
    });

    // Update unread count for all connected users
    for (const [userId, socket] of this.connectedUsers) {
      const unreadCount = await this.notificationsService.getUnreadCount(parseInt(userId));
      socket.emit('unread_count', { count: unreadCount });
    }
  }

  async notifyAdmins(notification: any) {
    this.server.to('admin').emit('notification_created', {
      notification,
      type: 'notification_created',
    });

    // Update unread count for admin users
    for (const [userId, socket] of this.connectedUsers) {
      const user = (socket as any).user;
      if (user?.roles?.includes('admin')) {
        const unreadCount = await this.notificationsService.getUnreadCount(parseInt(userId));
        socket.emit('unread_count', { count: unreadCount });
      }
    }
  }

  notifyNotificationRead(userId: string, notificationId: string) {
    const userRoom = `user_${userId}`;
    this.server.to(userRoom).emit('notification_read', {
      notificationId,
      type: 'notification_read',
    });
  }

  notifyNotificationDeleted(userId: string, notificationId: string) {
    const userRoom = `user_${userId}`;
    this.server.to(userRoom).emit('notification_deleted', {
      notificationId,
      type: 'notification_deleted',
    });
  }

  notifyBulkRead(userId: string) {
    const userRoom = `user_${userId}`;
    this.server.to(userRoom).emit('bulk_read', {
      userId,
      type: 'bulk_read',
    });
  }

  // Health check endpoint
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  // Get connection status
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Signal-specific WebSocket methods
  async notifySignalCreated(signal: any) {
    this.server.emit('signal_created', {
      signal,
      type: 'signal_created',
    });
    this.logger.log(`Broadcasted new signal: ${signal.symbol} ${signal.type}`);
  }

  async notifySignalClosed(signal: any) {
    this.server.emit('signal_closed', {
      signal,
      type: 'signal_closed',
    });
    this.logger.log(`Broadcasted closed signal: ${signal.symbol} ${signal.type}`);
  }

  async notifySignalUpdated(signal: any) {
    this.server.emit('signal_updated', {
      signal,
      type: 'signal_updated',
    });
    this.logger.log(`Broadcasted updated signal: ${signal.symbol} ${signal.type}`);
  }
} 