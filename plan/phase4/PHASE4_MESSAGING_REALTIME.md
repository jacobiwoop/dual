# 🚀 PHASE 4 — Messagerie Real-time

**Date de début** : 2 Mars 2026  
**Durée estimée** : 2-3 semaines  
**Statut** : 🔄 En cours

---

## 🎯 Objectif

Implémenter un système de messagerie en temps réel entre créateurs et clients avec WebSockets, notifications push, et fonctionnalités avancées.

---

## 📋 Checklist Générale

### 4.1 WebSockets & Infrastructure (Semaine 1)
- [ ] Installation Socket.io (server + types)
- [ ] Configuration Socket.io dans index.ts
- [ ] Middleware d'authentification Socket.io (JWT)
- [ ] Rooms par conversation
- [ ] Events de base (connect, disconnect, join-room)
- [ ] Reconnexion automatique
- [ ] Heartbeat / ping-pong

### 4.2 Messages Real-time (Semaine 2)
- [ ] Event `message:send`
- [ ] Event `message:received`
- [ ] Event `message:read`
- [ ] Event `typing:start` / `typing:stop`
- [ ] Event `user:online` / `user:offline`
- [ ] Persistence messages en DB
- [ ] Broadcast aux participants

### 4.3 Messages Médias Payants (Semaine 2-3)
- [ ] Schema pour médias payants
- [ ] Upload média dans message
- [ ] Blur/Lock sur médias non déverrouillés
- [ ] Unlock avec crédits (déduction)
- [ ] Transaction logging
- [ ] Preview thumbail (blurred)

### 4.4 Auto-Messages (Semaine 3)
- [ ] Table `auto_messages` en DB
- [ ] Types: welcome, subscription, tips
- [ ] Configuration par créateur
- [ ] Trigger automatique
- [ ] Variables dynamiques (nom, montant, etc.)
- [ ] Planning/délai d'envoi

### 4.5 Notifications Push (Semaine 3)
- [ ] Web Push API setup
- [ ] Service Worker
- [ ] Push notifications permissions
- [ ] Notification nouveau message
- [ ] Notification avec action (répondre)
- [ ] Badge count unread

### 4.6 UI/UX Améliorations
- [ ] Indicateurs "en ligne"
- [ ] "Vu à X minutes"
- [ ] Typing indicators animés
- [ ] Sound notifications
- [ ] Desktop notifications
- [ ] Scroll to bottom on new message
- [ ] Infinite scroll historique

---

## 🏗️ Architecture Technique

### Stack
```
Backend:
├─ Socket.io (WebSocket server)
├─ Redis (pub/sub pour scaling)
├─ Express (REST API existant)
└─ Prisma (persistence)

Frontend:
├─ Socket.io-client
├─ React hooks (useSocket, useMessages)
├─ Context API (SocketContext)
└─ Web Push API
```

### Events Socket.io

#### Client → Server
```typescript
// Connexion
socket.emit('authenticate', { token: string })

// Messages
socket.emit('message:send', { conversationId, content, mediaId? })
socket.emit('message:read', { messageId })
socket.emit('typing:start', { conversationId })
socket.emit('typing:stop', { conversationId })

// Rooms
socket.emit('conversation:join', { conversationId })
socket.emit('conversation:leave', { conversationId })
```

#### Server → Client
```typescript
// Messages
socket.on('message:new', { message: Message })
socket.on('message:delivered', { messageId })
socket.on('message:read', { messageId, readAt })

// Typing
socket.on('typing:user', { userId, username, isTyping })

// Presence
socket.on('user:online', { userId })
socket.on('user:offline', { userId, lastSeen })

// Errors
socket.on('error', { code, message })
```

---

## 📁 Fichiers à Créer/Modifier

### Backend
```
basic-instinct-api/
├─ src/
│  ├─ lib/
│  │  └─ socket.ts (NEW)          # Socket.io setup
│  ├─ controllers/
│  │  └─ socket/
│  │     ├─ messages.socket.ts (NEW)
│  │     ├─ presence.socket.ts (NEW)
│  │     └─ typing.socket.ts (NEW)
│  ├─ middleware/
│  │  └─ socketAuth.ts (NEW)      # JWT auth pour Socket.io
│  └─ index.ts (MODIFY)            # Intégrer Socket.io
├─ prisma/
│  └─ schema.prisma (MODIFY)       # AutoMessage, MessageMedia
```

### Frontend (Creator Studio)
```
creator/
├─ src/
│  ├─ context/
│  │  └─ SocketContext.tsx (NEW)
│  ├─ hooks/
│  │  ├─ useSocket.ts (NEW)
│  │  ├─ useMessages.ts (NEW)
│  │  └─ useTyping.ts (NEW)
│  └─ components/
│     └─ Messages.tsx (MODIFY)
```

### Frontend (Client App)
```
basic/
├─ src/
│  ├─ context/
│  │  └─ SocketContext.tsx (NEW)
│  └─ pages/
│     └─ MessagesPage.tsx (MODIFY)
```

---

## 🔧 Installation & Setup

### Dependencies
```bash
# Backend
npm install socket.io
npm install -D @types/socket.io

# Frontend (Creator)
cd creator
npm install socket.io-client

# Frontend (Client)
cd basic
npm install socket.io-client
```

### Configuration
```bash
# .env
SOCKET_PORT=3002
SOCKET_CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
REDIS_URL="redis://localhost:6379"
```

---

## 📊 Schema Prisma - Modifications

### AutoMessage (Nouveau)
```prisma
model AutoMessage {
  id          String   @id @default(uuid())
  creatorId   String
  type        String   // "welcome" | "subscription" | "tip"
  content     String
  mediaUrl    String?
  isActive    Boolean  @default(true)
  delayMin    Int      @default(0)  // Délai avant envoi (minutes)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  creator     User     @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  
  @@index([creatorId, type])
}
```

### Message (Modifier)
```prisma
model Message {
  // Champs existants...
  
  // Nouveaux champs
  isAutoMessage Boolean  @default(false)
  autoMessageId String?
  isPaid        Boolean  @default(false)
  price         Decimal? @db.Decimal(10, 2)
  unlockedBy    String[] // Array de userIds qui ont déverrouillé
}
```

---

## 🧪 Tests & Validation

### Tests Manuels
- [ ] Connexion WebSocket
- [ ] Envoi message temps réel
- [ ] Réception message
- [ ] Typing indicators
- [ ] Presence (online/offline)
- [ ] Reconnexion après perte réseau
- [ ] Multiple tabs/devices
- [ ] Messages payants
- [ ] Auto-messages

### Tests Automatisés
- [ ] Unit tests Socket.io handlers
- [ ] Integration tests WebSocket flow
- [ ] Load testing (100+ connections)

---

## 📝 Notes

### Décisions Techniques

**Pourquoi Socket.io et pas WebSocket natif ?**
- Fallback automatique (long-polling)
- Rooms & namespaces built-in
- Reconnexion automatique
- Meilleur support navigateurs

**Redis pour Pub/Sub ?**
- Nécessaire pour scaling horizontal
- Multiple serveurs Socket.io
- Session persistence

**Authentification Socket.io ?**
- JWT dans handshake
- Vérification à chaque connexion
- Rooms basées sur userId

---

## 🚀 Plan de Développement (Détaillé)

### Jour 1-2: Setup Infrastructure
1. Installer Socket.io
2. Configurer dans index.ts
3. Créer middleware auth
4. Setup rooms basiques
5. Test connexion/déconnexion

### Jour 3-4: Messages Real-time
1. Event message:send
2. Persistence DB
3. Broadcast aux participants
4. Event message:received
5. Event message:read

### Jour 5-6: Typing & Presence
1. Typing indicators
2. Online/offline status
3. Last seen tracking
4. Debounce typing events

### Jour 7-8: Messages Payants
1. Schema médias payants
2. Upload flow
3. Blur/lock UI
4. Unlock avec crédits
5. Transaction logging

### Jour 9-10: Auto-Messages
1. Table AutoMessage
2. CRUD API
3. Trigger logic
4. Variables dynamiques
5. UI configuration

### Jour 11-12: Notifications Push
1. Web Push API setup
2. Service Worker
3. Permissions flow
4. Push on new message
5. Badge count

### Jour 13-14: Polish & Tests
1. UI/UX improvements
2. Error handling
3. Tests automatisés
4. Load testing
5. Documentation

---

## 🎯 KPIs de Succès

- ✅ Messages délivrés en < 100ms
- ✅ Support 1000+ connexions simultanées
- ✅ Reconnexion automatique < 2s
- ✅ 0 messages perdus
- ✅ Typing indicators < 50ms latence
- ✅ Push notifications 95%+ delivery

---

**Status**: 🔄 En cours  
**Prochaine étape**: Installation Socket.io et setup infrastructure
