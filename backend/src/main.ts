import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { join } from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';

class SocketIOAdapter extends IoAdapter {
  createIOServer(port: number, options?: Record<string, any>): any {
    const server = super.createIOServer(port, {
      ...options,
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
      pingTimeout: 60000,
      pingInterval: 25000,
    });
    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configure Socket.IO adapter
  app.useWebSocketAdapter(new SocketIOAdapter(app));
  
  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  
  // Enhanced validation pipe for better error messages
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    exceptionFactory: (errors) => {
      console.log('Validation errors:', errors);
      return errors;
    },
  }));
  
  // Enhanced CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001', 
      'https://localhost:3000',
      'https://localhost:3001',
      // Add your production domains here
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
  });

  const port = process.env.PORT || 3002;
  const server = await app.listen(port);
  
  // Add pure WebSocket server for non-Socket.IO connections
  const wss = new WebSocketServer({ 
    server: app.getHttpServer(),
    path: '/ws/notifications'
  });
  
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    console.log('🔗 Pure WebSocket connection established');
    
    // Extract token from query parameters
    const url = parse(req.url || '', true);
    const token = url.query.token as string;
    
    if (!token) {
      console.log('❌ No token provided, closing connection');
      ws.close(1008, 'Token required');
      return;
    }
    
    console.log('✅ WebSocket authenticated with token');
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'WebSocket connected successfully'
    }));
    
    ws.on('message', (message) => {
      console.log('📩 WebSocket message received:', message.toString());
    });
    
    ws.on('close', () => {
      console.log('🔌 Pure WebSocket disconnected');
    });
    
    ws.on('error', (error) => {
      console.log('❌ Pure WebSocket error:', error);
    });
  });

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`WebSocket server is running on: ws://localhost:${port}/ws/notifications`);
}
bootstrap();
