# ⚙️ Basic Instinct — API & Base de Données

> Document de référence pour le développement de `basic-instinct-api`
> Stack : Node.js + Express + SQLite (dev) → PostgreSQL (prod) + Prisma + Redis (Docker) + Cloudflare R2

---

## 1. Vue d'ensemble de l'architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  basic-instinct │     │ basic-instinct-  │     │ basic-instinct- │
│   (client)      │     │   studio        │     │    admin        │
│   :3000         │     │   :3001         │     │    :3002        │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │  HTTPS + JWT
                                 ▼
                    ┌────────────────────────┐
                    │   basic-instinct-api   │
                    │   Node.js + Express    │
                    │       :4000            │
                    └────────────┬───────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
     │  SQLite      │  │    Redis     │  │ Cloudflare   │
     │  (dev)       │  │  (Docker)    │  │     R2       │
     │  PostgreSQL  │  │  sessions,   │  │  médias,     │
     │  (prod)      │  │  realtime    │  │  photos,     │
     │  via Prisma  │  │              │  │  vidéos KYC  │
     └──────────────┘  └──────────────┘  └──────────────┘
```

---

## 2. Stack technique

| Couche            | Dev                  | Prod                    | Notes                                  |
| ----------------- | -------------------- | ----------------------- | -------------------------------------- |
| Runtime           | Node.js 20+          | Node.js 20+             |                                        |
| Framework         | Express.js           | Express.js              |                                        |
| ORM               | Prisma               | Prisma                  | Change juste le `provider` pour migrer |
| Base de données   | **SQLite**           | **PostgreSQL 16**       | Même code, 0 réécriture                |
| Cache / Realtime  | **Redis (Docker)**   | Redis (Docker ou Cloud) |                                        |
| Stockage fichiers | **Cloudflare R2**    | **Cloudflare R2**       | Free tier 10 Go, egress gratuit        |
| Paiements         | ❌ simulé            | Stripe (plus tard)      | Phase 12+                              |
| Auth              | JWT + Refresh tokens | JWT + Refresh tokens    |                                        |
| Upload            | Multer + R2          | Multer + R2             | Upload direct depuis le frontend       |
| Validation        | Zod                  | Zod                     |                                        |
| WebSocket         | Socket.io            | Socket.io               |                                        |
| Emails            | Resend               | Resend                  |                                        |
| Infra             | docker-compose       | docker-compose          |                                        |

---

## 3. SQLite en dev → PostgreSQL en prod

### Prisma rend la migration triviale

```prisma
// schema.prisma — DEV
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// schema.prisma — PROD (un seul mot à changer)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Le code des controllers, services et requêtes est **identique** dans les deux cas. Prisma abstrait complètement la différence.

### Limites SQLite à connaître

Prisma émule automatiquement en SQLite ce qui n'existe pas nativement :

- Les `enum` → stockés comme `String` (Prisma valide côté JS)
- Les tableaux (`String[]`) → stockés en JSON sérialisé
- Les `JSONB` → stockés comme `String` JSON
- `gen_random_uuid()` → géré par Prisma côté application

Aucune réécriture nécessaire à la migration. On fait `prisma migrate` et c'est tout.

---

## 4. Redis via Docker

### docker-compose.yml complet

```yaml
version: "3.9"

services:
  api:
    build: .
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: development
      DATABASE_URL: "file:./prisma/dev.db"
      REDIS_URL: "redis://redis:6379"
      JWT_ACCESS_SECRET: "change_me_in_prod_64_chars_minimum"
      JWT_REFRESH_SECRET: "another_secret_64_chars_minimum_different"
      JWT_ACCESS_EXPIRES: "15m"
      JWT_REFRESH_EXPIRES: "30d"
      R2_ENDPOINT: "${R2_ENDPOINT}"
      R2_ACCESS_KEY: "${R2_ACCESS_KEY}"
      R2_SECRET_KEY: "${R2_SECRET_KEY}"
      R2_BUCKET_PUBLIC: "bi-media-public"
      R2_BUCKET_PRIVATE: "bi-media-private"
      R2_CDN_URL: "${R2_CDN_URL}"
      RESEND_API_KEY: "${RESEND_API_KEY}"
      EMAIL_FROM: "noreply@basic-instinct.com"
      ALLOWED_ORIGINS: "http://localhost:3000,http://localhost:3001,http://localhost:3002"
    volumes:
      - ./prisma:/app/prisma # persiste la DB SQLite
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379" # exposé localement pour debug
    volumes:
      - redis_data:/data # persiste les sessions entre redémarrages
    command: redis-server --appendonly yes # active la persistence disque
    restart: unless-stopped

volumes:
  redis_data:
```

`docker compose up` → tout démarre en une commande, rien à installer sur la machine.

### Ce que Redis gère concrètement

```
redis:sessions:{accountId}     → refresh token (TTL 30 jours)
redis:online:{accountId}       → présence en ligne (TTL 5 min, renouvelé à chaque action)
redis:socket:{accountId}       → socket ID courant pour routing des events
```

Quand un admin suspend un compte, on supprime la clé `sessions:{accountId}` → déconnexion immédiate à la prochaine requête, sans attendre l'expiration du JWT.

---

## 5. Cloudflare R2 — Stockage fichiers

### Tarifs

```
Stockage        →  10 Go/mois GRATUIT, puis 0.015 $/Go
Opérations      →  1 million requêtes/mois GRATUIT, puis 0.36 $/million
Egress (sortie) →  TOUJOURS GRATUIT (même en prod, même à grande échelle)
```

L'egress gratuit est l'avantage clé sur AWS S3 (~0.09$/Go). Sur une plateforme vidéo avec beaucoup de téléchargements, la différence peut représenter des centaines d'euros/mois en prod.

Le free tier couvre entièrement la phase de dev et les premiers mois après le lancement.

### Buckets

```
bi-media-public/    → médias créateurs (photos, vidéos visibles aux clients)
bi-media-private/   → documents KYC (accès admin uniquement via URLs signées)
bi-avatars/         → photos de profil et couvertures (public)
```

### R2 est compatible API S3

R2 implémente l'API AWS S3. On utilise le SDK `@aws-sdk/client-s3` avec l'endpoint R2 — aucune lib spécifique Cloudflare nécessaire.

```typescript
// lib/r2.ts
import { S3Client } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT, // https://<account>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});
```

### Flow d'upload (upload direct depuis le frontend)

```
1. Frontend demande une URL pré-signée à l'API
   POST /creator/media/upload-url
   { mimeType: 'image/jpeg', size: 2400000 }

2. API génère une URL R2 pré-signée (valide 5 min)
   → retourne { uploadUrl, fileKey }

3. Frontend upload DIRECTEMENT vers R2 (pas via l'API)
   PUT {uploadUrl}  avec le fichier binaire en body

4. Frontend confirme l'upload à l'API
   POST /creator/media
   { fileKey, type, visibility, price, description }

5. API crée l'entrée en base + retourne l'URL CDN publique
   → retourne { id, url, thumbnailUrl }
```

L'API ne sert jamais de proxy aux fichiers binaires — ça évite de saturer le serveur.

### Types de fichiers acceptés

```
Images       : jpeg, png, webp  — max 20 Mo
Vidéos       : mp4, mov, webm   — max 2 Go
Documents KYC: jpeg, png, pdf   — max 10 Mo (bucket privé)
```

---

## 6. Stripe — Plus tard (Phase 12)

Stripe sera intégré uniquement pour les vrais paiements CB. En attendant, le système de crédits fonctionne **sans paiement réel** :

- En dev : endpoint `POST /dev/credits/add` pour créditer un compte manuellement (désactivé en prod)
- Les flows internes (abonnement, tips, achats) fonctionnent dès la phase 5 via les crédits simulés
- Quand Stripe arrivera : on branche uniquement `POST /client/credits/purchase` sur une session Stripe Checkout, le reste ne change pas

---

## 7. Base de données — Schéma complet

### 7.1 Table `accounts` — Tous les comptes (creators + clients + admins)

```prisma
model Account {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?                         // null si OAuth
  role          String                          // 'creator' | 'client' | 'admin'
  status        String    @default("active")    // 'active' | 'pending' | 'suspended' | 'banned'
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  lastIp        String?
  googleId      String?   @unique

  creatorProfile  CreatorProfile?
  clientProfile   ClientProfile?
  adminProfile    AdminProfile?
  notifications   Notification[]
  auditLogs       AuditLog[]
}
```

> Pourquoi une seule table `accounts` ? Un créateur peut aussi être client. Le rôle détermine les droits. Les données spécifiques sont dans des tables liées.

---

### 7.2 Table `creator_profiles`

```prisma
model CreatorProfile {
  id                  String    @id @default(cuid())
  accountId           String    @unique
  account             Account   @relation(fields: [accountId], references: [id])
  username            String    @unique
  displayName         String
  bio                 String?
  welcomeMessage      String?
  avatarUrl           String?
  coverUrl            String?
  profilePhotos       String    @default("[]")  // JSON array d'URLs
  categories          String    @default("[]")  // JSON array
  tags                String    @default("[]")  // JSON array
  country             String?
  ageDisplayed        Int?
  physique            String?                   // JSON objet
  isVerified          Boolean   @default(false)
  kycStatus           String    @default("not_submitted")
  isVisible           Boolean   @default(true)
  vacationMode        Boolean   @default(false)
  vacationMessage     String?
  blockedCountries    String    @default("[]")  // JSON array
  balanceCredits      Int       @default(0)
  commissionRate      Float     @default(20.0)
  ibanEncrypted       String?
  withdrawalThreshold Int       @default(5000)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  media           MediaItem[]
  galleries       Gallery[]
  libraryFolders  LibraryFolder[]
  showTypes       ShowType[]
  autoMessages    AutoMessage[]
  kycSubmissions  KycSubmission[]
  withdrawals     Withdrawal[]
  notes           CreatorNote[]
}
```

---

### 7.3 Table `client_profiles`

```prisma
model ClientProfile {
  id             String   @id @default(cuid())
  accountId      String   @unique
  account        Account  @relation(fields: [accountId], references: [id])
  username       String   @unique
  displayName    String
  avatarUrl      String?
  country        String?
  balanceCredits Int      @default(0)
  totalSpent     Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  subscriptions  Subscription[]
  purchases      Purchase[]
  notes          CreatorNote[]
}
```

---

### 7.4 Table `subscriptions`

```prisma
model Subscription {
  id            String    @id @default(cuid())
  clientId      String
  client        ClientProfile  @relation(fields: [clientId], references: [id])
  creatorId     String
  creator       CreatorProfile @relation(fields: [creatorId], references: [id])
  tier          String                          // 'normal' | 'plus'
  priceCredits  Int
  status        String    @default("active")    // 'active' | 'cancelled' | 'expired'
  startedAt     DateTime  @default(now())
  renewsAt      DateTime?
  cancelledAt   DateTime?

  @@unique([clientId, creatorId])
}
```

---

### 7.5 Table `messages`

```prisma
model Message {
  id           String   @id @default(cuid())
  creatorId    String
  clientId     String
  senderRole   String                          // 'creator' | 'client'
  type         String                          // 'text' | 'image' | 'video' | 'tip' | 'locked_media'
  content      String?
  mediaUrl     String?
  isPaid       Boolean  @default(false)
  priceCredits Int      @default(0)
  isPurchased  Boolean  @default(false)
  tipAmount    Int?
  isRead       Boolean  @default(false)
  isAuto       Boolean  @default(false)
  createdAt    DateTime @default(now())

  @@index([creatorId, clientId, createdAt])
}
```

---

### 7.6 Table `creator_notes`

```prisma
model CreatorNote {
  id        String         @id @default(cuid())
  creatorId String
  creator   CreatorProfile @relation(fields: [creatorId], references: [id])
  clientId  String
  client    ClientProfile  @relation(fields: [clientId], references: [id])
  content   String
  updatedAt DateTime       @updatedAt

  @@unique([creatorId, clientId])
}
```

---

### 7.7 Table `media_items`

```prisma
model MediaItem {
  id             String         @id @default(cuid())
  creatorId      String
  creator        CreatorProfile @relation(fields: [creatorId], references: [id])
  type           String                          // 'image' | 'video'
  url            String
  thumbnailUrl   String?
  visibility     String                          // 'free' | 'subscribers' | 'paid'
  priceCredits   Int            @default(0)
  description    String?
  galleryId      String?
  gallery        Gallery?       @relation(fields: [galleryId], references: [id])
  folderId       String?
  folder         LibraryFolder? @relation(fields: [folderId], references: [id])
  sortOrder      Int            @default(0)
  fileSizeBytes  BigInt?
  durationSec    Int?
  isFlagged      Boolean        @default(false)
  isVisible      Boolean        @default(true)
  salesCount     Int            @default(0)
  revenueCredits Int            @default(0)
  uploadDate     DateTime       @default(now())

  @@index([creatorId, galleryId])
}
```

---

### 7.8 Table `galleries`

```prisma
model Gallery {
  id             String         @id @default(cuid())
  creatorId      String
  creator        CreatorProfile @relation(fields: [creatorId], references: [id])
  title          String
  description    String?
  coverUrl       String?
  visibility     String                          // 'free' | 'subscribers' | 'paid'
  priceCredits   Int            @default(0)
  salesCount     Int            @default(0)
  revenueCredits Int            @default(0)
  isVisible      Boolean        @default(true)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  items          MediaItem[]
}
```

---

### 7.9 Table `library_folders`

```prisma
model LibraryFolder {
  id          String         @id @default(cuid())
  creatorId   String
  creator     CreatorProfile @relation(fields: [creatorId], references: [id])
  title       String
  description String?
  coverUrl    String?
  createdAt   DateTime       @default(now())

  items       MediaItem[]
}
```

---

### 7.10 Table `purchases`

```prisma
model Purchase {
  id           String        @id @default(cuid())
  clientId     String
  client       ClientProfile @relation(fields: [clientId], references: [id])
  creatorId    String
  itemType     String                            // 'media' | 'gallery' | 'message_media'
  itemId       String
  priceCredits Int
  purchasedAt  DateTime      @default(now())

  @@index([clientId, creatorId])
}
```

---

### 7.11 Table `transactions`

```prisma
model Transaction {
  id             String    @id @default(cuid())
  clientId       String?
  creatorId      String?
  type           String                          // 'credit_purchase' | 'subscription' | 'tip' | 'media' | 'gallery' | 'show' | 'refund'
  amountCredits  Int
  amountEur      Float
  commissionEur  Float     @default(0)
  commissionRate Float?
  status         String    @default("completed") // 'pending' | 'completed' | 'failed' | 'refunded'
  referenceId    String?
  paymentMethod  String?
  paymentIntentId String?
  refundedAt     DateTime?
  refundReason   String?
  createdAt      DateTime  @default(now())

  @@index([creatorId, createdAt])
}
```

---

### 7.12 Table `show_requests`

```prisma
model ShowRequest {
  id            String    @id @default(cuid())
  clientId      String
  creatorId     String
  typeLabel     String
  description   String?
  priceCredits  Int
  status        String    @default("pending")   // 'pending' | 'accepted' | 'refused' | 'completed'
  refusalReason String?
  requestedAt   DateTime  @default(now())
  respondedAt   DateTime?
  completedAt   DateTime?
}
```

---

### 7.13 Table `show_types`

```prisma
model ShowType {
  id            String         @id @default(cuid())
  creatorId     String
  creator       CreatorProfile @relation(fields: [creatorId], references: [id])
  emoji         String?
  title         String
  description   String?
  priceCredits  Int
  durationLabel String?
  availability  String         @default("always") // 'always' | 'on_demand' | 'disabled'
  isActive      Boolean        @default(true)
  sortOrder     Int            @default(0)
  createdAt     DateTime       @default(now())
}
```

---

### 7.14 Table `auto_messages`

```prisma
model AutoMessage {
  id           String         @id @default(cuid())
  creatorId    String
  creator      CreatorProfile @relation(fields: [creatorId], references: [id])
  trigger      String                            // 'new_message_offline' | 'new_subscriber' | 'anniversary_1m' | 'inactivity_7d' | 'after_tip'
  content      String
  delayMinutes Int            @default(0)
  mediaId      String?
  isActive     Boolean        @default(true)
  sentCount    Int            @default(0)
  createdAt    DateTime       @default(now())

  @@unique([creatorId, trigger])
}
```

---

### 7.15 Table `withdrawals`

```prisma
model Withdrawal {
  id              String         @id @default(cuid())
  creatorId       String
  creator         CreatorProfile @relation(fields: [creatorId], references: [id])
  amountCredits   Int
  amountEur       Float
  commissionEur   Float
  netEur          Float
  ibanSnapshot    String?
  status          String         @default("pending") // 'pending' | 'processing' | 'completed' | 'rejected'
  rejectionReason String?
  adminId         String?
  requestedAt     DateTime       @default(now())
  processedAt     DateTime?
  completedAt     DateTime?
}
```

---

### 7.16 Table `reports`

```prisma
model Report {
  id          String    @id @default(cuid())
  reporterId  String
  creatorId   String?
  contentType String                            // 'media' | 'profile' | 'message'
  contentId   String?
  reason      String                            // 'illegal' | 'minor' | 'non_consensual' | 'fraud' | 'spam' | 'off_category'
  description String?
  status      String    @default("open")        // 'open' | 'reviewing' | 'resolved' | 'dismissed'
  priority    String    @default("medium")      // 'low' | 'medium' | 'high' | 'critical'
  actionTaken String?
  resolvedBy  String?
  createdAt   DateTime  @default(now())
  resolvedAt  DateTime?
}
```

---

### 7.17 Table `kyc_submissions`

```prisma
model KycSubmission {
  id               String         @id @default(cuid())
  creatorId        String
  creator          CreatorProfile @relation(fields: [creatorId], references: [id])
  legalName        String
  birthDate        DateTime
  documentType     String                        // 'id_card' | 'passport' | 'residence_permit'
  documentFront    String?                       // URL R2 privé
  documentBack     String?
  status           String         @default("pending") // 'pending' | 'verified' | 'rejected'
  rejectionReason  String?
  reviewedBy       String?
  submittedAt      DateTime       @default(now())
  reviewedAt       DateTime?
}
```

---

### 7.18 Table `admin_profiles`

```prisma
model AdminProfile {
  id        String   @id @default(cuid())
  accountId String   @unique
  account   Account  @relation(fields: [accountId], references: [id])
  name      String
  adminRole String                              // 'super_admin' | 'moderator' | 'accountant'
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}
```

---

### 7.19 Table `audit_logs`

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  adminId    String
  admin      Account  @relation(fields: [adminId], references: [id])
  action     String                              // ex: 'creator.suspend'
  targetType String?
  targetId   String?
  payload    String?                             // JSON (before/after)
  ip         String?
  createdAt  DateTime @default(now())

  @@index([adminId, createdAt])
}
```

---

### 7.20 Table `notifications`

```prisma
model Notification {
  id        String   @id @default(cuid())
  accountId String
  account   Account  @relation(fields: [accountId], references: [id])
  type      String                              // 'new_message' | 'new_subscriber' | 'tip' ...
  title     String?
  body      String?
  data      String?                             // JSON contextuel
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([accountId, isRead, createdAt])
}
```

---

### 7.21 Table `platform_settings`

```prisma
model PlatformSetting {
  key       String   @id
  value     String                              // JSON
  updatedBy String?
  updatedAt DateTime @updatedAt
}

// Clés par défaut à seed :
// 'credit_rate'         → {"eur_per_credit": 0.01}
// 'default_commission'  → {"rate": 20}
// 'withdrawal_minimum'  → {"credits": 5000}
// 'registrations_open'  → {"creators": true, "clients": true}
// 'kyc_required'        → {"enabled": true}
// 'maintenance_mode'    → {"enabled": false, "message": ""}
```

---

## 8. Authentification & Sécurité

### 8.1 Système JWT + Redis

```json
{
  "access_token": "...", // durée 15 min, vérifié à chaque requête
  "refresh_token": "..." // durée 30 jours, httpOnly cookie + stocké dans Redis
}
```

**Payload access token :**

```json
{
  "sub": "account-cuid",
  "role": "creator",
  "profileId": "creator-profile-cuid",
  "iat": 1234567890,
  "exp": 1234568790
}
```

Redis stocke les refresh tokens valides. Pour déconnecter un compte de force (suspension, ban), on supprime la clé Redis — le prochain refresh échoue et l'utilisateur est éjecté.

### 8.2 Middleware de rôles

```
requireAuth()                    → token valide requis
requireRole('creator')           → doit être créateur
requireRole('admin')             → doit être admin
requireAdminRole('super_admin')  → super admin uniquement
```

### 8.3 Isolation des données

Règle absolue : **un créateur ne peut jamais lire les données d'un autre créateur.**

```typescript
// ✅ Correct — filtre par l'utilisateur connecté
const media = await prisma.mediaItem.findMany({
  where: { creatorId: req.user.profileId },
});

// ❌ Dangereux — ne jamais faire ça
const media = await prisma.mediaItem.findMany({
  where: { creatorId: req.params.creatorId },
});
```

---

## 9. Endpoints API complets

### 9.1 Auth — `/auth`

```
POST /auth/register          → créer un compte (creator ou client)
POST /auth/login             → connexion → retourne access + refresh token
POST /auth/refresh           → renouveler l'access token avec le refresh token
POST /auth/logout            → invalider le refresh token dans Redis
POST /auth/forgot-password   → envoyer email reset
POST /auth/reset-password    → nouveau mot de passe avec token email
GET  /auth/me                → profil de l'utilisateur connecté
```

---

### 9.2 Créateur (Studio) — `/creator`

**Profil :**

```
GET  /creator/profile              → son profil complet
PUT  /creator/profile              → modifier ses infos
POST /creator/profile/avatar       → upload photo profil
POST /creator/profile/cover        → upload photo couverture
```

**Médias :**

```
GET    /creator/media              → liste ses médias (filtre type/visibility)
POST   /creator/media/upload-url   → obtenir URL pré-signée R2
POST   /creator/media              → confirmer upload + créer entrée en base
PUT    /creator/media/:id          → modifier description/prix/visibilité
DELETE /creator/media/:id          → supprimer
```

**Galeries :**

```
GET    /creator/galleries              → liste ses galeries
POST   /creator/galleries              → créer une galerie
PUT    /creator/galleries/:id          → modifier
DELETE /creator/galleries/:id          → supprimer
POST   /creator/galleries/:id/media    → ajouter un média
DELETE /creator/galleries/:id/media/:mediaId → retirer
PUT    /creator/galleries/:id/reorder  → réordonner les médias
```

**Bibliothèque messages :**

```
GET    /creator/library                → tous ses médias bibliothèque
POST   /creator/library/upload-url     → URL pré-signée R2
POST   /creator/library                → confirmer upload
DELETE /creator/library/:id            → supprimer
GET    /creator/library/folders        → liste ses dossiers
POST   /creator/library/folders        → créer un dossier
PUT    /creator/library/folders/:id
DELETE /creator/library/folders/:id
```

**Messages :**

```
GET  /creator/conversations                        → liste conversations (filtre + search)
GET  /creator/conversations/:clientId/messages     → messages (pagination)
POST /creator/conversations/:clientId/messages     → envoyer (texte ou média)
PUT  /creator/conversations/:clientId/read         → marquer comme lu
GET  /creator/conversations/:clientId/client       → fiche client
POST /creator/notes/:clientId                      → sauvegarder note
GET  /creator/notes/:clientId                      → lire note
```

**Demandes spéciales :**

```
GET  /creator/requests                → liste (filtre statut)
PUT  /creator/requests/:id/accept     → accepter (débite le client)
PUT  /creator/requests/:id/refuse     → refuser (motif optionnel)
```

**Types de shows :**

```
GET    /creator/show-types            → liste
POST   /creator/show-types            → créer
PUT    /creator/show-types/:id        → modifier
DELETE /creator/show-types/:id        → supprimer
PUT    /creator/show-types/reorder    → réordonner
```

**Messages automatiques :**

```
GET    /creator/auto-messages         → liste
POST   /creator/auto-messages         → créer
PUT    /creator/auto-messages/:id     → modifier
DELETE /creator/auto-messages/:id     → supprimer
```

**Finances :**

```
GET  /creator/balance                         → solde actuel
GET  /creator/transactions                    → historique
GET  /creator/withdrawals                     → historique retraits
POST /creator/withdrawals                     → demander un retrait
PUT  /creator/settings/iban                   → modifier IBAN
PUT  /creator/settings/withdrawal-threshold   → modifier seuil retrait auto
```

**Paramètres :**

```
PUT  /creator/settings/privacy                → pays bloqués, mode vacances, visibilité
PUT  /creator/settings/notifications          → préférences notifs
POST /creator/settings/block/:clientId        → bloquer un client
DELETE /creator/settings/block/:clientId      → débloquer
```

**KYC :**

```
POST /creator/kyc                  → soumettre documents (multipart → R2 privé)
GET  /creator/kyc/status           → statut vérification actuel
```

**Stats :**

```
GET  /creator/stats/overview       → KPIs (revenus, abonnés, ventes)
GET  /creator/stats/revenue        → revenus par période
GET  /creator/stats/subscribers    → évolution abonnés
```

---

### 9.3 Client — `/client`

**Profil :**

```
GET  /client/profile               → son profil
PUT  /client/profile               → modifier
POST /client/profile/avatar        → upload avatar
```

**Découverte :**

```
GET  /explore/creators             → liste créateurs publics (filtres)
GET  /explore/creators/:username   → profil public d'un créateur
GET  /explore/search               → recherche
```

**Abonnements :**

```
GET    /client/subscriptions                  → liste abonnements actifs
POST   /client/subscriptions                  → s'abonner
DELETE /client/subscriptions/:creatorId       → se désabonner
```

**Médias & Achats :**

```
GET  /client/creators/:creatorId/media        → médias selon abonnement
GET  /client/creators/:creatorId/galleries    → galeries accessibles
POST /client/purchases/media/:mediaId         → acheter un média
POST /client/purchases/gallery/:galleryId     → acheter une galerie
GET  /client/purchases                        → historique achats
```

**Messages :**

```
GET  /client/conversations                              → liste conversations
GET  /client/conversations/:creatorId/messages          → messages
POST /client/conversations/:creatorId/messages          → envoyer
POST /client/messages/:messageId/purchase               → débloquer un média payant
PUT  /client/conversations/:creatorId/read              → marquer comme lu
```

**Shows & Tips :**

```
GET  /client/creators/:creatorId/show-types  → shows disponibles
POST /client/requests                        → envoyer une demande
GET  /client/requests                        → ses demandes
POST /client/tips                            → envoyer un tip
```

**Crédits :**

```
GET  /client/balance               → solde crédits
POST /client/credits/purchase      → acheter crédits (Stripe — phase 12)
GET  /client/transactions          → historique dépenses
```

**Divers :**

```
POST /reports                      → signaler un contenu ou profil
GET  /notifications                → liste notifs (paginé)
PUT  /notifications/:id/read       → marquer comme lu
PUT  /notifications/read-all       → tout marquer lu
```

---

### 9.4 Admin — `/admin`

```
-- Stats
GET  /admin/stats                         → KPIs plateforme
GET  /admin/stats/revenue                 → graphique revenus
GET  /admin/stats/users                   → évolution inscriptions

-- Créateurs
GET  /admin/creators                      → liste paginée + filtres
GET  /admin/creators/:id                  → fiche complète
PUT  /admin/creators/:id/verify           → valider/rejeter KYC
PUT  /admin/creators/:id/suspend          → suspendre
PUT  /admin/creators/:id/ban              → bannir
PUT  /admin/creators/:id/reactivate
PUT  /admin/creators/:id/commission-rate  → taux personnalisé

-- Clients
GET  /admin/clients                       → liste paginée
GET  /admin/clients/:id                   → fiche complète
PUT  /admin/clients/:id/suspend
PUT  /admin/clients/:id/ban

-- Modération
GET  /admin/reports                       → file signalements
GET  /admin/reports/:id                   → détail
PUT  /admin/reports/:id/resolve           → traiter

-- Médias
GET    /admin/media                       → tous les médias
PUT    /admin/media/:id/hide              → masquer
DELETE /admin/media/:id                   → supprimer

-- Transactions
GET  /admin/transactions                  → toutes (filtres)
GET  /admin/transactions/:id              → détail
POST /admin/transactions/:id/refund       → rembourser

-- Retraits
GET  /admin/withdrawals                   → file d'attente + historique
PUT  /admin/withdrawals/:id/approve       → valider
PUT  /admin/withdrawals/:id/reject        → refuser

-- Commissions
GET  /admin/commissions/summary
GET  /admin/commissions/by-creator

-- Paramètres & équipe
GET  /admin/settings
PUT  /admin/settings
GET  /admin/team
POST /admin/team
PUT  /admin/team/:id/deactivate

-- Logs
GET  /admin/logs
```

---

### 9.5 Dev uniquement — `/dev`

```
POST /dev/credits/add     → créditer un compte manuellement (désactivé en prod)
GET  /dev/seed            → remplir la base avec des données de test
DELETE /dev/reset         → vider toute la base (dev only)
```

---

## 10. Temps réel — WebSocket (Socket.io + Redis)

```
// Rooms
creator:{creatorId}    → room privée du créateur
client:{clientId}      → room privée du client
admin:alerts           → alertes globales admin

// Événements serveur → client
'message:new'          → { conversationId, message }
'message:read'         → { conversationId }
'user:online'          → { clientId }
'user:offline'         → { clientId }
'tip:received'         → { amount, clientName }
'subscription:new'     → { clientName, tier }
'purchase:completed'   → { itemTitle, amount }
'request:new'          → { requestId, type, price }
'report:new'           → { reportId, priority }          // admin only
'withdrawal:new'       → { withdrawalId, amount }        // admin only
```

---

## 11. Système de crédits

```
1 crédit = 0.01 € (modifiable dans platform_settings)

Packs exemple :
100 crédits   = 1 €
500 crédits   = 4.50 € (-10%)
1000 crédits  = 8 €   (-20%)
5000 crédits  = 35 €  (-30%)
```

**Flow transaction interne (atomique) :**

```
Client achète un média à 200 crédits
→ Prisma $transaction :
   client.balanceCredits      -= 200
   creator.balanceCredits     += 200 * (1 - commissionRate/100)
   Purchase.create(...)
   Transaction.create(...)
→ Socket.io → 'purchase:completed' au créateur
→ Notification créée
```

---

## 12. Emails transactionnels (Resend)

| Événement       | Destinataire    | Template                       |
| --------------- | --------------- | ------------------------------ |
| Inscription     | Client/Créateur | Bienvenue + vérification email |
| KYC validé      | Créateur        | Profil activé                  |
| KYC rejeté      | Créateur        | Motif + re-soumission          |
| Abonnement reçu | Créateur        | Nouveau abonné                 |
| Retrait validé  | Créateur        | Montant + délai                |
| Retrait refusé  | Créateur        | Motif                          |
| Suspension      | Créateur/Client | Durée + motif + support        |
| Reset password  | Tous            | Lien (valide 1h)               |
| Tip reçu        | Créateur        | Montant                        |

---

## 13. Variables d'environnement

```env
# Base de données
DATABASE_URL="file:./prisma/dev.db"          # SQLite dev
# DATABASE_URL="postgresql://..."             # PostgreSQL prod

# Redis
REDIS_URL="redis://redis:6379"               # Docker

# JWT
JWT_ACCESS_SECRET="64_chars_random_string"
JWT_REFRESH_SECRET="64_chars_different_random_string"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="30d"

# Cloudflare R2
R2_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com"
R2_ACCESS_KEY="..."
R2_SECRET_KEY="..."
R2_BUCKET_PUBLIC="bi-media-public"
R2_BUCKET_PRIVATE="bi-media-private"
R2_CDN_URL="https://cdn.basic-instinct.com"

# Stripe (phase 12 — laisser vide pour l'instant)
# STRIPE_SECRET_KEY="sk_..."
# STRIPE_WEBHOOK_SECRET="whsec_..."

# Emails
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@basic-instinct.com"

# App
PORT=4000
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001,http://localhost:3002"
NODE_ENV="development"
```

---

## 14. Structure des dossiers

```
basic-instinct-api/
├── prisma/
│   ├── schema.prisma          → schéma Prisma complet
│   ├── dev.db                 → SQLite (gitignore en prod)
│   ├── migrations/            → migrations auto-générées
│   └── seed.ts                → données de test
│
├── src/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── creator.ts
│   │   ├── client.ts
│   │   ├── admin.ts
│   │   ├── explore.ts
│   │   ├── notifications.ts
│   │   └── dev.ts             → routes dev uniquement
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── creator/
│   │   │   ├── profile.controller.ts
│   │   │   ├── media.controller.ts
│   │   │   ├── messages.controller.ts
│   │   │   ├── requests.controller.ts
│   │   │   └── finances.controller.ts
│   │   ├── client/
│   │   │   ├── profile.controller.ts
│   │   │   ├── subscriptions.controller.ts
│   │   │   └── purchases.controller.ts
│   │   └── admin/
│   │       ├── creators.controller.ts
│   │       ├── moderation.controller.ts
│   │       ├── finances.controller.ts
│   │       └── settings.controller.ts
│   │
│   ├── middleware/
│   │   ├── auth.ts            → vérification JWT
│   │   ├── roles.ts           → requireRole()
│   │   ├── validate.ts        → validation Zod
│   │   └── devOnly.ts         → bloque routes /dev en prod
│   │
│   ├── services/
│   │   ├── credits.service.ts     → transactions Prisma atomiques
│   │   ├── email.service.ts       → Resend
│   │   ├── upload.service.ts      → URLs pré-signées R2
│   │   ├── socket.service.ts      → événements temps réel
│   │   └── auto-message.service.ts
│   │
│   ├── lib/
│   │   ├── prisma.ts          → client Prisma singleton
│   │   ├── redis.ts           → client Redis singleton
│   │   └── r2.ts              → client S3/R2
│   │
│   ├── jobs/                  → tâches cron
│   │   ├── subscription-renewal.ts
│   │   ├── auto-messages.ts
│   │   └── cleanup.ts
│   │
│   ├── schema/                → schémas Zod
│   │   ├── auth.schema.ts
│   │   ├── creator.schema.ts
│   │   └── admin.schema.ts
│   │
│   └── index.ts               → Express + Socket.io
│
├── docker-compose.yml
├── Dockerfile
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 15. Ordre de développement recommandé

| Phase | Ce qu'on build                               | Débloque                         |
| ----- | -------------------------------------------- | -------------------------------- |
| 1     | Docker Compose (API + Redis) + Prisma SQLite | Tout le reste                    |
| 2     | Auth (register/login/JWT/Redis)              | Tout le reste                    |
| 3     | Profils créateur + client                    | Studio Profil + Client Explore   |
| 4     | Upload R2 + médias + galeries                | Studio Médias                    |
| 5     | Messages + WebSocket                         | Studio Messages                  |
| 6     | Abonnements + crédits simulés                | Client Abonnement                |
| 7     | Transactions internes (achats, tips)         | Achats médias                    |
| 8     | Demandes spéciales                           | Studio Demandes                  |
| 9     | Messages automatiques                        | Studio Settings                  |
| 10    | Retraits                                     | Studio Finances + Admin Retraits |
| 11    | KYC                                          | Admin Créateurs                  |
| 12    | Modération + signalements                    | Admin Modération                 |
| 13    | Dashboard admin + stats                      | Admin Dashboard                  |
| 14    | Emails transactionnels (Resend)              | Notifications email              |
| 15    | Tâches cron                                  | Renouvellement abos              |
| 16    | Stripe (vrais paiements)                     | Achat crédits réel               |
| 17    | Migration SQLite → PostgreSQL                | Prod ready                       |
