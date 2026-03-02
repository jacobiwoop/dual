# 🚀 Basic Instinct API

API backend complète pour la plateforme Basic Instinct (Creator Studio, Client App, Admin Panel).

---

## 📊 Vue d'ensemble

- **Version** : 1.0.0
- **Endpoints** : 79 routes API
- **Base de données** : 26 tables Prisma
- **Authentification** : JWT + Refresh Tokens
- **Technologies** : Node.js, Express, TypeScript, Prisma, SQLite

---

## 🏗️ Architecture

```
basic-instinct-api/
├── prisma/
│   ├── schema.prisma       # 26 tables
│   ├── migrations/         # Migrations Prisma
│   ├── seed.ts            # Données de test
│   └── dev.db             # SQLite database
├── src/
│   ├── index.ts           # Serveur Express
│   ├── routes/            # 4 fichiers de routes
│   ├── controllers/       # 13 contrôleurs
│   ├── middleware/        # Auth & Roles
│   ├── lib/              # Prisma client
│   └── types/            # Types TypeScript
└── Basic-Instinct-API.postman_collection.json
```

---

## 🚦 Démarrage rapide

### Prérequis
- Node.js 20+
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env

# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Seed la base de données
npm run db:seed

# Démarrer le serveur
npm run dev
```

Le serveur démarre sur **http://localhost:3001**

---

## 📋 Scripts npm

```bash
npm run dev          # Développement avec hot-reload
npm run build        # Compiler TypeScript
npm start            # Production

npm run db:migrate   # Créer/appliquer migrations
npm run db:reset     # Reset DB + re-seed
npm run db:seed      # Seed données de test
npm run db:studio    # Ouvrir Prisma Studio
npm run db:generate  # Générer client Prisma
```

---

## 🔐 Authentification

### Comptes de test (après seed)

**Créateur :**
- Email: `creator@test.com`
- Password: `password123`
- Username: `bella_creator`

**Client :**
- Email: `client@test.com`
- Password: `password123`
- Username: `john_client`

**Admin :**
- Email: `admin@basicinstinct.com`
- Password: `admin123`
- Username: `admin`

### Utilisation JWT

1. Login :
```bash
POST /api/auth/login
{
  "email": "creator@test.com",
  "password": "password123"
}
```

2. Utiliser le token dans les headers :
```
Authorization: Bearer <accessToken>
```

3. Refresh le token :
```bash
POST /api/auth/refresh
{
  "refreshToken": "<refreshToken>"
}
```

---

## 📚 Endpoints API (79 routes)

### 🔐 Auth (5 routes)
```
POST   /api/auth/register       # Inscription
POST   /api/auth/login          # Connexion
POST   /api/auth/refresh        # Refresh token
POST   /api/auth/logout         # Déconnexion
GET    /api/auth/me             # Profil utilisateur
```

### 🎨 Creator Studio (28 routes)

**Profile (4)**
```
GET    /api/creator/profile
PUT    /api/creator/profile
POST   /api/creator/profile/avatar
POST   /api/creator/profile/banner
```

**Analytics (5)**
```
GET    /api/creator/analytics/overview
GET    /api/creator/analytics/revenue
GET    /api/creator/analytics/subscribers
GET    /api/creator/analytics/top-clients
GET    /api/creator/analytics/stats
```

**Messages (6)**
```
GET    /api/creator/conversations
GET    /api/creator/conversations/:clientId/messages
POST   /api/creator/conversations/:clientId/messages
PUT    /api/creator/conversations/:clientId/read
GET    /api/creator/conversations/:clientId/info
POST   /api/creator/notes/:clientId
```

**Library (10)**
```
GET    /api/creator/library
POST   /api/creator/library
DELETE /api/creator/library/:id
PUT    /api/creator/library/:id/move
GET    /api/creator/library/stats
GET    /api/creator/library/folders
POST   /api/creator/library/folders
PUT    /api/creator/library/folders/:id
DELETE /api/creator/library/folders/:id
```

### 👤 Client (21 routes)

**Feed (5)**
```
GET    /api/client/feed
GET    /api/client/posts/:id
POST   /api/client/posts/:id/like
POST   /api/client/posts/:id/comment
GET    /api/client/posts/:id/comments
```

**Creators (6)**
```
GET    /api/client/creators
GET    /api/client/creators/:username
GET    /api/client/creators/:username/posts
GET    /api/client/creators/:username/galleries
POST   /api/client/creators/:id/subscribe
DELETE /api/client/creators/:id/subscribe
```

**Messages (4)**
```
GET    /api/client/conversations
GET    /api/client/conversations/:creatorId/messages
POST   /api/client/conversations/:creatorId/messages
POST   /api/client/messages/:id/unlock
```

**Credits (4)**
```
GET    /api/client/credits/balance
POST   /api/client/credits/purchase
GET    /api/client/credits/history
GET    /api/client/credits/packs
```

### 🛡️ Admin (25 routes)

**Dashboard (4)**
```
GET    /api/admin/dashboard
GET    /api/admin/logs
GET    /api/admin/settings
PUT    /api/admin/settings/:key
```

**Creators (6)**
```
GET    /api/admin/creators
GET    /api/admin/creators/:id
PUT    /api/admin/creators/:id/verify
PUT    /api/admin/creators/:id/suspend
PUT    /api/admin/creators/:id/kyc
GET    /api/admin/creators/:id/analytics
```

**Moderation (5)**
```
GET    /api/admin/moderation/posts
PUT    /api/admin/moderation/posts/:id
GET    /api/admin/moderation/media
PUT    /api/admin/moderation/media/:id
GET    /api/admin/moderation/stats
```

**Revenue (4)**
```
GET    /api/admin/transactions
GET    /api/admin/revenue/stats
GET    /api/admin/revenue/by-creator
GET    /api/admin/revenue/chart
```

**Withdrawals (5)**
```
GET    /api/admin/withdrawals
GET    /api/admin/withdrawals/:id
PUT    /api/admin/withdrawals/:id/approve
PUT    /api/admin/withdrawals/:id/reject
GET    /api/admin/withdrawals/stats
```

---

## 💾 Base de données (26 tables)

### Users & Auth
- `User` - Utilisateurs (creators, clients, admins)
- `RefreshToken` - Tokens JWT

### Messaging
- `Conversation`, `ConversationParticipant`, `Message`, `MessageMedia`

### Content
- `Post`, `PostMedia`, `Like`, `Comment`
- `MediaItem`, `Gallery`
- `LibraryFolder`, `LibraryItem`

### Monetization
- `Subscription`, `Purchase`, `Transaction`

### Shows
- `ShowRequest`, `ShowType`

### Automation
- `AutoMessage`

### Payments
- `KycSubmission`, `Withdrawal`

### Admin
- `CreatorNote`, `Notification`, `AdminLog`, `PlatformSettings`

---

## 🧪 Tests avec Postman

1. Importer la collection :
   - Fichier : `Basic-Instinct-API.postman_collection.json`

2. Variables automatiques :
   - `accessToken` - Mis à jour automatiquement après login
   - `refreshToken` - Mis à jour automatiquement
   - `creatorId`, `clientId` - IDs utilisateurs

3. Workflow de test :
   - Tester Health checks
   - Login Creator/Client/Admin
   - Tester les routes selon le rôle
   - Les tokens sont automatiquement injectés

---

## 🔧 Configuration (.env)

```env
# Database
DATABASE_URL="file:./dev.db"

# Server
PORT=3001
NODE_ENV="development"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="30d"

# CORS
CORS_ORIGIN="http://localhost:5173,http://localhost:3000,http://localhost:5174"
```

---

## 📦 Stack technique

- **Runtime** : Node.js 20+
- **Framework** : Express 4
- **Language** : TypeScript
- **Database** : Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- **Auth** : JWT + bcrypt
- **Validation** : À implémenter (Zod)
- **Rate Limiting** : À implémenter

---

## 🚧 TODO

### Phase 1 (En cours - 86%)
- [x] Schéma Prisma complet
- [x] Authentification JWT
- [x] Routes Creator (28)
- [x] Routes Client (21)
- [x] Routes Admin (25)
- [ ] Validation Zod
- [ ] Rate limiting
- [ ] Logging (Pino)

### Phase 2 (Prochainement)
- [ ] Upload médias (S3/R2)
- [ ] Presigned URLs
- [ ] Génération thumbnails
- [ ] Processing vidéos

### Phase 3
- [ ] Intégration Stripe
- [ ] Paiements réels
- [ ] Webhooks Stripe

---

## 📖 Documentation

- `plan/roadmap-v2.md` - Roadmap complète 9 phases
- `plan/PHASE1_BACKEND_FOUNDATION.md` - Plan Phase 1 détaillé
- `plan/basic-instinct-api.md` - Spécifications API complètes
- `plan/SESSION_SUMMARY_2MARS2026.md` - Résumé session

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📝 License

MIT License - voir LICENSE pour plus de détails

---

## 🎯 Prochaines étapes

1. **Finir Phase 1** : Validation Zod + Rate limiting (~4h)
2. **Phase 2** : Upload médias S3/R2 (2-3 semaines)
3. **Phase 3** : Paiements Stripe (4-5 semaines)

---

**Créé avec ❤️ pour Basic Instinct Platform**
