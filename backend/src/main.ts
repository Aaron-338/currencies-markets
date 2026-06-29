import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { join } from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage, createServer } from 'http';
import { parse } from 'url';
import express from 'express';

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
          'https://ivrex.co.ls', // ✅ Add production origin
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
    server.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);
  });

  server.on('connect_error', (err) => {
    console.log('❌ Socket.IO connection error:', err.message);
  });
    return server;
  }
}



async function bootstrap() {
  const expressApp = express(); // Create base Express app
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new (require('@nestjs/platform-express').ExpressAdapter)(expressApp)
  );

  app.useWebSocketAdapter(new SocketIOAdapter(app));

 /* app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });*/
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // URLs will be like http://localhost:3002/uploads/receipts/abc123.png
  });
  


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

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3000',
      'https://localhost:3001',
      'https://ivrex.co.ls', // ✅ Allow your domain
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
    maxAge: 86400,
  });

  await app.init();

  // 🚫 DO NOT call app.listen() in Passenger
  const httpServer = createServer(expressApp);

  // You must listen if using pure WebSockets manually
  const port = process.env.PORT || 3002;
  httpServer.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📡 WebSocket running on ws://localhost:${port}/ws/notifications`);
  });

  // ✅ Attach pure WebSocket server to the manually created server
  const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws/notifications',
  });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    console.log('🔗 Pure WebSocket connection established');

    const url = parse(req.url || '', true);
    const token = url.query.token as string;

    if (!token) {
      console.log('❌ No token provided, closing connection');
      ws.close(1008, 'Token required');
      return;
    }

    console.log('✅ WebSocket authenticated with token');

    ws.send(JSON.stringify({
      type: 'connected',
      message: 'WebSocket connected successfully',
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
}

bootstrap();