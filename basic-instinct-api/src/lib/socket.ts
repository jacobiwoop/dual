import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from './logger';
import { prisma } from './prisma';
import redis from './redis';
import { r2Client, R2_BUCKET_NAME, extractR2Key } from './r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const CORS_ORIGINS = process.env.SOCKET_CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173'];

// Interface pour le socket authentifié
export interface AuthenticatedSocket extends Socket {
  userId: string;
  userRole: 'CLIENT' | 'CREATOR' | 'ADMIN';
  userEmail: string;
}

// Configuration Socket.io
export function setupSocketIO(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: CORS_ORIGINS,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Middleware d'authentification
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      // Vérifier le token JWT
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        role: 'CLIENT' | 'CREATOR' | 'ADMIN';
        email: string;
      };

      // Vérifier que l'utilisateur existe toujours
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true, email: true, isSuspended: true },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      if (user.isSuspended) {
        return next(new Error('User is suspended'));
      }

      // Attacher les infos user au socket
      const authSocket = socket as AuthenticatedSocket;
      authSocket.userId = user.id;
      authSocket.userRole = user.role as 'CLIENT' | 'CREATOR' | 'ADMIN';
      authSocket.userEmail = user.email;

      logger.info({ userId: user.id, socketId: socket.id }, 'Socket.io: User authenticated');
      next();
    } catch (error: any) {
      logger.error({ error: error.message }, 'Socket.io: Authentication failed');
      next(new Error('Authentication failed'));
    }
  });

  // Events de connexion
  io.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    
    logger.info({ 
      userId: authSocket.userId, 
      socketId: socket.id 
    }, 'Socket.io: Client connected');

    // Joindre une room personnelle pour l'utilisateur
    socket.join(`user:${authSocket.userId}`);

    // Marquer l'utilisateur comme en ligne dans Redis
    redis.sadd('presence:online', authSocket.userId).then(() => {
      // Broadcast à tout le monde que l'utilisateur est en ligne
      io.emit('user:online', { userId: authSocket.userId });
    }).catch((e) =>
      logger.error({ e }, 'Redis: failed to mark user online')
    );

    // Event: disconnect
    socket.on('disconnect', async (reason) => {
      logger.info({ 
        userId: authSocket.userId, 
        socketId: socket.id,
        reason 
      }, 'Socket.io: Client disconnected');

      // Retirer l'utilisateur de présence Redis
      // Vérifier d'abord s'il n'a pas d'autres sockets actives
      const otherSockets = await io.in(`user:${authSocket.userId}`).fetchSockets();
      if (otherSockets.length === 0) {
        await redis.srem('presence:online', authSocket.userId);
        io.emit('user:offline', { 
          userId: authSocket.userId,
          lastSeen: new Date(),
        });
        logger.info({ userId: authSocket.userId }, 'Socket.io: User is offline');
      }
    });

    // Event: error
    socket.on('error', (error) => {
      logger.error({ 
        userId: authSocket.userId, 
        error 
      }, 'Socket.io: Socket error');
    });

    // Import des handlers
    setupMessageHandlers(io, authSocket);
    setupPresenceHandlers(io, authSocket);
    setupTypingHandlers(io, authSocket);
  });

  logger.info('✅ Socket.io server initialized');
  return io;
}

// ============================================
// Message Handlers
// ============================================
function setupMessageHandlers(io: Server, socket: AuthenticatedSocket) {
  // Rejoindre une conversation
  socket.on('conversation:join', async (data: { conversationId: string }) => {
    try {
      const { conversationId } = data;

      // Vérifier que l'utilisateur est participant
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { creatorId: socket.userId },
            { clientId: socket.userId },
          ],
        },
      });

      if (!conversation) {
        socket.emit('error', { code: 'FORBIDDEN', message: 'Not a participant of this conversation' });
        return;
      }

      // Joindre la room
      socket.join(`conversation:${conversationId}`);
      
      logger.info({ 
        userId: socket.userId, 
        conversationId 
      }, 'Socket.io: User joined conversation');

      socket.emit('conversation:joined', { conversationId });
    } catch (error: any) {
      logger.error({ error }, 'Socket.io: Error joining conversation');
      socket.emit('error', { code: 'SERVER_ERROR', message: error.message });
    }
  });

  // Quitter une conversation
  socket.on('conversation:leave', (data: { conversationId: string }) => {
    const { conversationId } = data;
    socket.leave(`conversation:${conversationId}`);
    
    logger.info({ 
      userId: socket.userId, 
      conversationId 
    }, 'Socket.io: User left conversation');
  });

  // Envoyer un message
  socket.on('message:send', async (data: { conversationId: string; content?: string; mediaId?: string; isPaid?: boolean; price?: number }) => {
    try {
      const { conversationId, content, mediaId, isPaid, price } = data;

      // Vérifier la conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { creatorId: socket.userId },
            { clientId: socket.userId },
          ],
        },
        include: {
          creator: { select: { id: true, username: true, displayName: true } },
          client: { select: { id: true, username: true, displayName: true } },
        },
      });

      if (!conversation) {
        socket.emit('error', { code: 'FORBIDDEN', message: 'Conversation not found' });
        return;
      }

      // Créer le message en DB
      const rawMessage = await prisma.message.create({
        data: {
          conversationId,
          senderId: socket.userId,
          recipientId: socket.userId === conversation.creatorId ? conversation.clientId : conversation.creatorId,
          content: content || null,
          type: mediaId ? 'media' : 'text',
          isPaid: isPaid || false,
          price: isPaid && price ? price : null,
          ...(mediaId && {
            mediaAttachments: {
              create: [{ libraryItemId: mediaId }],
            },
          }),
        },
        include: {
          sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          mediaAttachments: {
            include: { libraryItem: true },
          },
        },
      });

      // Signer les URLs si média présent
      let message = rawMessage;
      if (rawMessage.mediaAttachments && rawMessage.mediaAttachments.length > 0) {
        const updatedAttachments = await Promise.all(rawMessage.mediaAttachments.map(async (att: any) => {
          if (!att.libraryItem) return att;

          let displayUrl = att.libraryItem.url;
          try {
            const key = extractR2Key(att.libraryItem.url);
            const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
            displayUrl = await getSignedUrl(r2Client, command, { expiresIn: 604800 });
          } catch (e) { /* fallback */ }

          let displayThumbnail = att.libraryItem.thumbnailUrl;
          if (att.libraryItem.thumbnailUrl) {
            try {
              const key = extractR2Key(att.libraryItem.thumbnailUrl);
              const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
              displayThumbnail = await getSignedUrl(r2Client, command, { expiresIn: 604800 });
            } catch (e) { /* fallback */ }
          }

          return {
            ...att,
            libraryItem: {
              ...att.libraryItem,
              url: displayUrl,
              thumbnailUrl: displayThumbnail,
              sizeBytes: att.libraryItem.sizeBytes !== null ? Number(att.libraryItem.sizeBytes) : null,
            }
          };
        }));

        message = {
          ...rawMessage,
          mediaAttachments: updatedAttachments as any
        };
      }

      // Mettre à jour lastMessageAt de la conversation
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });

      // Broadcast aux participants de la conversation
      io.to(`conversation:${conversationId}`).emit('message:new', { message });

      // Envoyer notification au destinataire s'il n'est pas dans la room
      const recipientId = message.recipientId;
      io.to(`user:${recipientId}`).emit('notification:new-message', {
        conversationId,
        message,
        sender: message.sender,
      });

      logger.info({ 
        messageId: message.id, 
        conversationId, 
        senderId: socket.userId 
      }, 'Socket.io: Message sent');

    } catch (error: any) {
      logger.error({ error }, 'Socket.io: Error sending message');
      socket.emit('error', { code: 'SERVER_ERROR', message: error.message });
    }
  });

  // Marquer un message comme lu
  socket.on('message:read', async (data: { messageId: string }) => {
    try {
      const { messageId } = data;

      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        socket.emit('error', { code: 'NOT_FOUND', message: 'Message not found' });
        return;
      }

      // Seul le destinataire peut marquer comme lu
      if (message.recipientId !== socket.userId) {
        socket.emit('error', { code: 'FORBIDDEN', message: 'Not the recipient' });
        return;
      }

      // Mettre à jour
      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: { readAt: new Date() },
      });

      // Notifier l'expéditeur
      io.to(`user:${message.senderId}`).emit('message:read', {
        messageId: updatedMessage.id,
        readAt: updatedMessage.readAt,
        conversationId: message.conversationId,
      });

      logger.info({ messageId, userId: socket.userId }, 'Socket.io: Message marked as read');

    } catch (error: any) {
      logger.error({ error }, 'Socket.io: Error marking message as read');
      socket.emit('error', { code: 'SERVER_ERROR', message: error.message });
    }
  });
}

// ============================================
// Presence Handlers (Online/Offline)
// ============================================
function setupPresenceHandlers(io: Server, socket: AuthenticatedSocket) {
  // Le client émet user:online pour signaler sa présence explicitement
  socket.on('user:online', async () => {
    try {
      // Redis: ajouter dans le Set de présence (idempotent)
      await redis.sadd('presence:online', socket.userId);

      // Broadcast à tous les autres connectés
      socket.broadcast.emit('user:online', { userId: socket.userId });

      logger.info({ userId: socket.userId }, 'Socket.io: User is online');
    } catch (error: any) {
      logger.error({ error }, 'Socket.io: Error updating online status');
    }
  });
  // Note: le handler disconnect est géré directement dans setupSocketIO
  // pour s'assurer qu'il s'exécute APRÈS tous les autres handlers
}

// ============================================
// Typing Handlers
// ============================================
function setupTypingHandlers(io: Server, socket: AuthenticatedSocket) {
  // Typing start
  socket.on('typing:start', async (data: { conversationId: string }) => {
    const { conversationId } = data;

    // Broadcast aux autres participants de la conversation (sauf l'émetteur)
    socket.to(`conversation:${conversationId}`).emit('typing:user', {
      userId: socket.userId,
      conversationId,
      isTyping: true,
    });

    logger.debug({ userId: socket.userId, conversationId }, 'Socket.io: User started typing');
  });

  // Typing stop
  socket.on('typing:stop', async (data: { conversationId: string }) => {
    const { conversationId } = data;

    socket.to(`conversation:${conversationId}`).emit('typing:user', {
      userId: socket.userId,
      conversationId,
      isTyping: false,
    });

    logger.debug({ userId: socket.userId, conversationId }, 'Socket.io: User stopped typing');
  });
}

export default setupSocketIO;
