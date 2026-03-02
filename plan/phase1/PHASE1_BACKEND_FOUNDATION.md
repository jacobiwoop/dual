# 🚀 PHASE 1 — Backend & API Foundation

**Durée estimée**: 4-6 semaines  
**Statut**: 🟡 En cours  
**Priorité**: CRITIQUE

---

## 📊 État actuel (Analyse)

### ✅ Ce qui existe déjà

**Creator Studio Backend**:
- ✅ Express server configuré (`server.ts`)
- ✅ Authentification JWT basique (`auth.controller.ts`, `auth.routes.ts`)
- ✅ Prisma configuré avec SQLite
- ✅ Schéma Prisma partiel (Users, Conversations, Messages, Library)
- ✅ Migration initiale créée
- ✅ CORS et express-async-errors
- ✅ Dependencies installées: bcryptjs, jsonwebtoken, prisma, express

### 🔴 Ce qui manque

**Tables Prisma** (basées sur `basic-instinct-api.md`):
- ❌ `accounts` (table auth centralisée)
- ❌ `creator_profiles` (profils créateurs étendus)
- ❌ `client_profiles` (profils clients)
- ❌ `subscriptions` (abonnements créateur-client)
- ❌ `posts` (contenu public feed)
- ❌ `likes`, `comments` (interactions)
- ❌ `media_items` (médias publics/payants)
- ❌ `galleries` (galeries publiques)
- ❌ `purchases` (achats de contenu)
- ❌ `transactions` (historique financier)
- ❌ `show_requests` (demandes de shows custom)
- ❌ `show_types` (types de shows configurables)
- ❌ `auto_messages` (messages automatiques)
- ❌ `kyc_submissions` (vérification identité)
- ❌ `withdrawals` (demandes de retrait)
- ❌ `creator_notes` (notes sur clients)
- ❌ `notifications` (système de notifications)
- ❌ `admin_logs` (audit trail)
- ❌ `platform_settings` (config globale)

**Backend**:
- ❌ Middleware d'authentification réutilisable
- ❌ Middleware de rôles (RBAC)
- ❌ Validation des inputs (Zod)
- ❌ Rate limiting
- ❌ Refresh tokens (Redis optionnel)
- ❌ Routes API Creator complètes
- ❌ Routes API Client
- ❌ Routes API Admin
- ❌ Gestion erreurs centralisée
- ❌ Logger structuré
- ❌ Variables d'environnement complètes

---

## 🎯 Objectifs Phase 1

1. **Schéma Prisma complet** avec toutes les tables nécessaires
2. **Authentification robuste** (JWT + refresh tokens + RBAC)
3. **Routes API prioritaires** pour les 3 apps (Creator, Client, Admin)
4. **Middlewares de sécurité** (auth, roles, validation, rate limiting)
5. **Structure backend scalable** (controllers, services, middlewares)
6. **Migration SQLite → PostgreSQL** (préparation)

---

## 📋 Plan d'action détaillé

### Semaine 1-2: Schema & Auth

#### Task 1.1: Compléter le schéma Prisma ⏳
**Priorité**: CRITIQUE  
**Durée**: 2-3 jours

**Actions**:
1. Fusionner l'architecture actuelle avec les specs de `basic-instinct-api.md`
2. Créer un schéma Prisma unifié avec toutes les tables
3. Ajouter indexes pour performance
4. Documenter les relations complexes
5. Créer migration Prisma

**Fichiers à modifier**:
- `creator/prisma/schema.prisma`

**Décisions à prendre**:
- [ ] Garder le modèle `User` actuel ou migrer vers `Account` + `CreatorProfile` + `ClientProfile`?
- [ ] SQLite pour dev ou migrer directement vers PostgreSQL?

**Recommandation**: Garder la simplicité avec le modèle `User` actuel enrichi, migration vers multi-tables plus tard.

---

#### Task 1.2: Améliorer l'authentification JWT 🔐
**Priorité**: HAUTE  
**Durée**: 2-3 jours

**Actions**:
1. Ajouter refresh tokens (stockage en DB ou Redis)
2. Endpoint `/auth/refresh` pour renouveler access token
3. Endpoint `/auth/logout` (invalider refresh token)
4. Endpoint `/auth/me` (profil utilisateur connecté)
5. Améliorer sécurité JWT (secrets forts, expiration courte)

**Fichiers à créer/modifier**:
- `creator/src/controllers/auth.controller.ts` (extend)
- `creator/src/routes/auth.routes.ts` (add routes)
- `creator/.env.example` (add JWT_SECRET, JWT_REFRESH_SECRET)

**Code à ajouter**:
```typescript
// Refresh token model (si stockage en DB)
model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

#### Task 1.3: Middlewares d'authentification 🛡️
**Priorité**: HAUTE  
**Durée**: 1-2 jours

**Actions**:
1. Créer middleware `requireAuth` (vérifier JWT)
2. Créer middleware `requireRole(['CREATOR', 'ADMIN'])` (RBAC)
3. Enrichir `req.user` avec infos utilisateur
4. Gestion erreurs 401/403 propre

**Fichiers à créer**:
- `creator/src/middlewares/auth.middleware.ts`
- `creator/src/middlewares/roles.middleware.ts`
- `creator/src/types/express.d.ts` (extend Request)

**Exemple code**:
```typescript
// creator/src/types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
        profileId?: string;
      };
    }
  }
}
```

---

### Semaine 2-3: Routes API Creator Studio

#### Task 2.1: Routes Messages 💬
**Priorité**: CRITIQUE  
**Durée**: 3-4 jours

**Endpoints à créer**:
```
GET    /api/creator/conversations
GET    /api/creator/conversations/:clientId/messages
POST   /api/creator/conversations/:clientId/messages
PUT    /api/creator/conversations/:clientId/read
GET    /api/creator/conversations/stats
```

**Fichiers à créer**:
- `creator/src/routes/creator/messages.routes.ts`
- `creator/src/controllers/creator/messages.controller.ts`
- `creator/src/services/messages.service.ts` (optionnel)

**Features**:
- Pagination des messages (cursor-based)
- Envoi texte + médias
- Messages payants (isPaid, price)
- Marquage "lu" (lastReadAt)
- Statistiques (messages non lus, dernière activité)

---

#### Task 2.2: Routes Library (Médias privés) 📁
**Priorité**: HAUTE  
**Durée**: 2-3 jours

**Endpoints**:
```
GET    /api/creator/library
GET    /api/creator/library/folders
POST   /api/creator/library/folders
PUT    /api/creator/library/folders/:id
DELETE /api/creator/library/folders/:id
POST   /api/creator/library/upload
DELETE /api/creator/library/:id
PUT    /api/creator/library/:id/move
```

**Fichiers**:
- `creator/src/routes/creator/library.routes.ts`
- `creator/src/controllers/creator/library.controller.ts`

**Notes**:
- Upload temporaire (local storage ou presigned URL S3)
- Validation type fichier (images/videos uniquement)
- Génération thumbnails (phase 2)

---

#### Task 2.3: Routes Profile 👤
**Priorité**: MOYENNE  
**Durée**: 1-2 jours

**Endpoints**:
```
GET    /api/creator/profile
PUT    /api/creator/profile
POST   /api/creator/profile/avatar
PUT    /api/creator/profile/pricing
```

**Fichiers**:
- `creator/src/routes/creator/profile.routes.ts`
- `creator/src/controllers/creator/profile.controller.ts`

---

#### Task 2.4: Routes Dashboard (Analytics) 📊
**Priorité**: MOYENNE  
**Durée**: 2 jours

**Endpoints**:
```
GET /api/creator/analytics/overview
GET /api/creator/analytics/revenue
GET /api/creator/analytics/subscribers
```

**Fichiers**:
- `creator/src/routes/creator/analytics.routes.ts`
- `creator/src/controllers/creator/analytics.controller.ts`

**Data à retourner**:
- Revenus du mois/semaine
- Nouveaux abonnés
- Messages envoyés/reçus
- Graphiques (Recharts dans le frontend)

---

### Semaine 3-4: Routes API Client

#### Task 3.1: Routes Feed 📱
**Priorité**: HAUTE  
**Durée**: 2-3 jours

**Endpoints**:
```
GET  /api/client/feed
POST /api/client/posts/:id/like
POST /api/client/posts/:id/comment
GET  /api/client/posts/:id/comments
```

**Fichiers**:
- `creator/src/routes/client/feed.routes.ts`
- `creator/src/controllers/client/feed.controller.ts`

**Notes**:
- Pagination (infinite scroll)
- Filtre par créateurs suivis
- Tri chronologique ou par engagement

---

#### Task 3.2: Routes Creators (Profils publics) 🌟
**Endpoints**:
```
GET  /api/client/creators/:username
GET  /api/client/creators/:id/media
POST /api/client/creators/:id/subscribe
DELETE /api/client/creators/:id/subscribe
```

---

#### Task 3.3: Routes Messages (côté client) 💬
**Endpoints**:
```
GET  /api/client/conversations
GET  /api/client/conversations/:creatorId/messages
POST /api/client/conversations/:creatorId/messages
POST /api/client/messages/:id/unlock
```

---

#### Task 3.4: Routes Credits 💳
**Endpoints**:
```
GET  /api/client/credits/balance
POST /api/client/credits/purchase
GET  /api/client/credits/history
```

**Note**: Intégration Stripe (Phase 3), pour l'instant mock data.

---

### Semaine 4-5: Routes API Admin

#### Task 4.1: Routes Creators Management 🛠️
**Endpoints**:
```
GET  /api/admin/creators
GET  /api/admin/creators/:id
PUT  /api/admin/creators/:id/verify
PUT  /api/admin/creators/:id/suspend
GET  /api/admin/creators/:id/analytics
```

---

#### Task 4.2: Routes Moderation 🚨
**Endpoints**:
```
GET  /api/admin/moderation/queue
POST /api/admin/moderation/:id/approve
POST /api/admin/moderation/:id/reject
GET  /api/admin/moderation/stats
```

---

#### Task 4.3: Routes Transactions 💰
**Endpoints**:
```
GET /api/admin/transactions
GET /api/admin/revenue/stats
GET /api/admin/revenue/by-creator
```

---

#### Task 4.4: Routes Withdrawals 🏦
**Endpoints**:
```
GET  /api/admin/withdrawals
PUT  /api/admin/withdrawals/:id/approve
PUT  /api/admin/withdrawals/:id/reject
```

---

### Semaine 5-6: Polish & Validation

#### Task 5.1: Validation des inputs avec Zod ✅
**Priorité**: HAUTE  
**Durée**: 2-3 jours

**Actions**:
1. Installer Zod: `npm install zod`
2. Créer schémas de validation pour chaque endpoint
3. Middleware de validation réutilisable

**Fichiers à créer**:
- `creator/src/middlewares/validate.middleware.ts`
- `creator/src/schemas/auth.schemas.ts`
- `creator/src/schemas/message.schemas.ts`
- etc.

**Exemple**:
```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(20).optional(),
  role: z.enum(['CREATOR', 'CLIENT']).default('CLIENT')
});

// Middleware
export const validate = (schema: z.ZodSchema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: error.errors });
    }
  };
};
```

---

#### Task 5.2: Rate Limiting 🚦
**Priorité**: MOYENNE  
**Durée**: 1 jour

**Actions**:
```bash
npm install express-rate-limit
```

**Configuration**:
```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives
  message: 'Trop de tentatives de connexion'
});

app.use('/api/auth/login', authLimiter);
```

---

#### Task 5.3: Logging structuré 📝
**Priorité**: MOYENNE  
**Durée**: 1 jour

**Actions**:
```bash
npm install pino pino-http
```

**Setup**:
- `creator/src/lib/logger.ts`
- Intégrer dans `server.ts`
- Logger toutes les requêtes
- Logger les erreurs

---

#### Task 5.4: Gestion d'erreurs centralisée ⚠️
**Priorité**: HAUTE  
**Durée**: 1 jour

**Fichiers**:
- `creator/src/middlewares/errorHandler.middleware.ts`
- `creator/src/utils/AppError.ts`

**Exemple**:
```typescript
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Usage
throw new AppError('Utilisateur non trouvé', 404);
```

---

#### Task 5.5: Variables d'environnement 🔐
**Priorité**: HAUTE  
**Durée**: 0.5 jour

**Compléter `.env.example`**:
```bash
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="30d"

# Server
PORT=3001
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Upload (Phase 2)
AWS_S3_BUCKET=""
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""

# Stripe (Phase 3)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
```

---

## 🗂️ Structure des dossiers (finale)

```
creator/
├── prisma/
│   ├── schema.prisma          ✅ Schéma complet
│   ├── migrations/
│   └── seed.ts                📝 À créer (données de test)
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts           ✅ Existe
│   │   ├── creator/
│   │   │   ├── messages.controller.ts   📝 À créer
│   │   │   ├── library.controller.ts    📝 À créer
│   │   │   ├── profile.controller.ts    📝 À créer
│   │   │   └── analytics.controller.ts  📝 À créer
│   │   ├── client/
│   │   │   ├── feed.controller.ts       📝 À créer
│   │   │   ├── creators.controller.ts   📝 À créer
│   │   │   └── messages.controller.ts   📝 À créer
│   │   └── admin/
│   │       ├── creators.controller.ts   📝 À créer
│   │       ├── moderation.controller.ts 📝 À créer
│   │       └── transactions.controller.ts 📝 À créer
│   ├── routes/
│   │   ├── auth.routes.ts               ✅ Existe
│   │   ├── creator/
│   │   │   ├── messages.routes.ts       📝 À créer
│   │   │   ├── library.routes.ts        📝 À créer
│   │   │   ├── profile.routes.ts        📝 À créer
│   │   │   └── analytics.routes.ts      📝 À créer
│   │   ├── client/
│   │   │   ├── feed.routes.ts           📝 À créer
│   │   │   ├── creators.routes.ts       📝 À créer
│   │   │   └── messages.routes.ts       📝 À créer
│   │   └── admin/
│   │       ├── creators.routes.ts       📝 À créer
│   │       ├── moderation.routes.ts     📝 À créer
│   │       └── transactions.routes.ts   📝 À créer
│   ├── middlewares/
│   │   ├── auth.middleware.ts           📝 À créer
│   │   ├── roles.middleware.ts          📝 À créer
│   │   ├── validate.middleware.ts       📝 À créer
│   │   └── errorHandler.middleware.ts   📝 À créer
│   ├── schemas/                         📝 À créer (Zod)
│   │   ├── auth.schemas.ts
│   │   ├── message.schemas.ts
│   │   └── ...
│   ├── services/                        📝 Optionnel (logique métier)
│   │   ├── auth.service.ts
│   │   ├── messages.service.ts
│   │   └── ...
│   ├── utils/
│   │   ├── AppError.ts                  📝 À créer
│   │   └── logger.ts                    📝 À créer
│   ├── types/
│   │   └── express.d.ts                 📝 À créer
│   ├── lib/
│   │   ├── prisma.ts                    ✅ Existe
│   │   └── utils.ts                     ✅ Existe
│   ├── server.ts                        ✅ Existe
│   └── main.tsx                         ✅ Frontend
└── .env.example                         📝 À compléter
```

---

## 📦 Dependencies à ajouter

```bash
# Validation
npm install zod

# Rate limiting
npm install express-rate-limit

# Logging
npm install pino pino-http

# Utils
npm install express-async-errors  # ✅ Déjà installé
```

---

## ✅ Checklist Phase 1

### Semaine 1-2: Schema & Auth
- [ ] Compléter schéma Prisma avec toutes les tables
- [ ] Créer migration Prisma
- [ ] Ajouter refresh tokens (table ou Redis)
- [ ] Endpoint `/auth/refresh`
- [ ] Endpoint `/auth/logout`
- [ ] Endpoint `/auth/me`
- [ ] Middleware `requireAuth`
- [ ] Middleware `requireRole`
- [ ] Types TypeScript pour `req.user`

### Semaine 2-3: Routes Creator
- [ ] Routes Messages (GET conversations, POST message, etc.)
- [ ] Routes Library (upload, folders, delete)
- [ ] Routes Profile (GET, PUT, avatar)
- [ ] Routes Analytics (dashboard data)

### Semaine 3-4: Routes Client
- [ ] Routes Feed (GET feed, like, comment)
- [ ] Routes Creators (profils publics, subscribe)
- [ ] Routes Messages (côté client)
- [ ] Routes Credits (balance, purchase mock)

### Semaine 4-5: Routes Admin
- [ ] Routes Creators Management
- [ ] Routes Moderation
- [ ] Routes Transactions
- [ ] Routes Withdrawals

### Semaine 5-6: Polish
- [ ] Validation Zod sur tous les endpoints
- [ ] Rate limiting (auth + endpoints sensibles)
- [ ] Logging structuré (Pino)
- [ ] Gestion erreurs centralisée
- [ ] Variables d'environnement complètes
- [ ] Seed database avec données de test
- [ ] Tests d'intégration basiques (optionnel)
- [ ] Documentation API (Postman ou Swagger)

---

## 🎯 Prochaines actions immédiates

**Aujourd'hui**:
1. Compléter le schéma Prisma avec les tables manquantes
2. Créer la migration
3. Tester la migration sur la DB

**Cette semaine**:
1. Améliorer l'authentification (refresh tokens)
2. Créer les middlewares auth/roles
3. Implémenter les routes Messages (Creator Studio)

**Bloqueurs potentiels**:
- Décision architecture: User unique vs Account + Profiles séparés
- Choix storage médias (local vs S3) → peut être fait en Phase 2
- PostgreSQL vs SQLite → garder SQLite pour dev, PostgreSQL pour prod

---

**Dernière mise à jour**: 2 mars 2026  
**Responsable**: Backend Team  
**Review**: Chaque vendredi (démo + planning semaine suivante)
