# 🗺️ Basic Instinct — Roadmap V2 (Mise à jour 2026)

> **Statut actuel**: Les 3 applications frontend (Creator Studio, Client, Admin) sont en développement actif avec interfaces UI complètes. Le backend et l'infrastructure sont en phase de conception/démarrage.

---

## 📊 État des lieux — Mars 2026

### ✅ Ce qui est déjà fait

#### 🎨 **Creator Studio** (`/creator`)
- ✅ Interface UI complète (30 fichiers TypeScript/React)
- ✅ Architecture React + Vite + TailwindCSS
- ✅ Pages principales implémentées:
  - Dashboard avec analytics et graphiques (Recharts)
  - Messagerie client avec conversations multiples
  - Bibliothèque de médias (Library) avec système de dossiers
  - Upload de médias avec crop d'images
  - Profil créateur éditable
  - Paramètres et auto-messages
  - Gestion des demandes clients
- ✅ **Schéma Prisma défini** (SQLite):
  - Tables: Users, Conversations, Messages, Library (folders + items)
  - Relations complètes entre entités
- ✅ **Backend Express minimal** (`server.ts`):
  - Routes d'authentification (`/api/auth`)
  - Healthcheck et test DB
  - Prisma configuré avec migrations initiales
- ✅ Composants UI réutilisables (modals, drawers, crop tool)
- ✅ Contexte d'authentification (AuthContext)
- ✅ Mock data pour développement

**État**: Frontend 90% complet • Backend 15% complet

---

#### 👤 **Client App** (`/basic`)
- ✅ Interface UI complète (19 fichiers TypeScript/React)
- ✅ Architecture React Router v6 + Vite + TailwindCSS
- ✅ Pages principales:
  - Feed avec posts, likes, commentaires
  - Stories horizontales
  - Profil créateur avec galeries
  - Messagerie (ChatSidebar)
  - Explorer, Notifications, Settings
  - Page d'achat de crédits
  - Live streaming (preview)
- ✅ Sidebar responsive avec collapse
- ✅ PWA ready (manifest + service worker)
- ✅ Design Instagram-like moderne

**État**: Frontend 85% complet • Backend 0%

---

#### 🛡️ **Admin Panel** (`/admin`)
- ✅ Interface UI complète (22 fichiers TypeScript/React)
- ✅ Dashboard avec statistiques globales
- ✅ Pages de gestion:
  - Créateurs (KYC, vérifications, revenus)
  - Clients (activité, dépenses)
  - Modération de contenu
  - Transactions et commissions
  - Retraits (withdrawals)
  - Logs système
  - Paramètres plateforme
- ✅ Composants réutilisables (StatCard, StatusBadge, AlertBanner)
- ✅ Mock data complet

**État**: Frontend 80% complet • Backend 0%

---

### 🔴 Ce qui manque (Priorités par phase)

---

## 🚀 PHASE 1 — Backend & API Foundation (4-6 semaines)

### Objectif: Créer un backend fonctionnel pour les 3 apps

#### 1.1 Infrastructure Backend
- [ ] **Décider architecture finale**: 
  - Option A: BFF séparé par app (3 serveurs Express)
  - Option B: API monolithique avec routes différenciées
  - ✅ **Recommandation**: Architecture BFF (voir `bff-architecture.md`)
- [ ] Setup environnements (dev/staging/prod)
- [ ] Configuration Docker pour chaque service
- [ ] Variables d'environnement (.env structure)
- [ ] Logging centralisé (Winston ou Pino)

#### 1.2 Base de données & Prisma
- [x] Schéma Prisma Creator (déjà fait)
- [ ] **Compléter le schéma avec toutes les tables manquantes**:
  - `subscriptions` (abonnements créateur-client)
  - `posts` (contenu public du créateur)
  - `likes`, `comments` (interactions)
  - `transactions` (paiements, tips, achats)
  - `credits` (système de crédits client)
  - `withdrawals` (demandes de retrait créateur)
  - `notifications` (système de notifs)
  - `media_uploads` (stockage métadonnées)
  - `admin_logs` (audit trail)
  - `platform_settings` (config globale)
- [ ] Migrations Prisma pour production
- [ ] Seeders avec données de test réalistes
- [ ] **Migration SQLite → PostgreSQL** (recommandé pour production)

#### 1.3 Authentification & Sécurité
- [ ] **JWT avec refresh tokens**
- [ ] Routes login/register pour les 3 rôles (CREATOR, CLIENT, ADMIN)
- [ ] Middleware d'authentification
- [ ] RBAC (Role-Based Access Control)
- [ ] Hash des mots de passe (bcrypt)
- [ ] Rate limiting (express-rate-limit)
- [ ] CORS configuré par environnement
- [ ] Validation des inputs (Zod ou Joi)

#### 1.4 Routes Creator Studio API (`/api/creator/*`)
- [ ] **Messages**:
  - GET `/api/creator/conversations` (liste conversations)
  - GET `/api/creator/messages/:conversationId` (messages)
  - POST `/api/creator/messages` (envoyer message)
  - POST `/api/creator/messages/paid` (message payant avec média)
- [ ] **Library**:
  - GET `/api/creator/library` (tous les médias)
  - POST `/api/creator/library/upload` (upload média)
  - DELETE `/api/creator/library/:id`
  - POST `/api/creator/library/folders` (créer dossier)
  - PUT `/api/creator/library/items/:id/move` (déplacer)
- [ ] **Profile**:
  - GET `/api/creator/profile`
  - PUT `/api/creator/profile` (update bio, prix abonnement, etc.)
  - POST `/api/creator/profile/avatar` (upload avatar)
- [ ] **Dashboard**:
  - GET `/api/creator/analytics` (revenus, stats, graphiques)
- [ ] **Settings**:
  - GET/PUT `/api/creator/settings`
  - POST `/api/creator/auto-messages` (messages automatiques)

#### 1.5 Routes Client API (`/api/client/*`)
- [ ] **Feed**:
  - GET `/api/client/feed` (posts publics des créateurs suivis)
  - POST `/api/client/posts/:id/like`
  - POST `/api/client/posts/:id/comment`
- [ ] **Creator Profiles**:
  - GET `/api/client/creators/:username` (profil public)
  - POST `/api/client/creators/:id/subscribe` (s'abonner)
- [ ] **Messages**:
  - GET `/api/client/conversations`
  - POST `/api/client/messages` (envoyer message à créateur)
  - POST `/api/client/messages/:id/unlock` (débloquer média payant)
- [ ] **Credits**:
  - GET `/api/client/credits/balance`
  - POST `/api/client/credits/purchase` (acheter crédits)
- [ ] **Notifications**:
  - GET `/api/client/notifications`

#### 1.6 Routes Admin API (`/api/admin/*`)
- [ ] **Creators Management**:
  - GET `/api/admin/creators` (liste + filtres)
  - PUT `/api/admin/creators/:id/verify` (valider KYC)
  - PUT `/api/admin/creators/:id/suspend`
- [ ] **Clients Management**:
  - GET `/api/admin/clients`
  - PUT `/api/admin/clients/:id/ban`
- [ ] **Moderation**:
  - GET `/api/admin/moderation/queue` (contenus signalés)
  - POST `/api/admin/moderation/:id/approve`
- [ ] **Transactions**:
  - GET `/api/admin/transactions`
  - GET `/api/admin/revenue/stats`
- [ ] **Withdrawals**:
  - GET `/api/admin/withdrawals` (demandes en attente)
  - POST `/api/admin/withdrawals/:id/process`
- [ ] **Logs**:
  - GET `/api/admin/logs` (audit trail)

---

## 🚀 PHASE 2 — Upload & Stockage Médias (2-3 semaines)

### Objectif: Permettre l'upload sécurisé de photos/vidéos

#### 2.1 Stockage
- [ ] **Choisir solution de stockage**:
  - Option A: **AWS S3** (scalable, CDN CloudFront)
  - Option B: **Cloudinary** (processing intégré)
  - Option C: **Self-hosted MinIO** (S3-compatible)
  - ✅ **Recommandation**: AWS S3 + CloudFront
- [ ] Setup buckets (public/private)
- [ ] Génération de signed URLs pour médias privés
- [ ] CDN pour delivery rapide

#### 2.2 Upload Flow
- [ ] **Upload direct depuis frontend** (presigned URLs)
- [ ] Validation côté serveur (type, taille, dimensions)
- [ ] Génération de thumbnails automatique
- [ ] Support images (JPEG, PNG, WebP)
- [ ] Support vidéos (MP4, WebM) avec encoding
- [ ] Watermarking optionnel pour médias payants
- [ ] Métadonnées stockées en DB (Prisma `LibraryItem`)

#### 2.3 Processing
- [ ] Queue de processing (BullMQ + Redis)
- [ ] Compression images (Sharp)
- [ ] Transcoding vidéos (FFmpeg via AWS MediaConvert)
- [ ] Détection de contenu interdit (AWS Rekognition ou similar)

---

## 🚀 PHASE 3 — Paiements & Monétisation (4-5 semaines)

### Objectif: Intégrer le système de paiement complet

#### 3.1 Gateway de paiement
- [ ] **Intégration Stripe**:
  - Stripe Connect pour paiements aux créateurs
  - Payment Intents pour achats clients
  - Webhooks Stripe
- [ ] Système de crédits (achat, consommation, historique)
- [ ] Calcul de commissions plateforme (20% par défaut)
- [ ] Gestion TVA (si applicable)

#### 3.2 Flux de paiement
- [ ] **Client achète des crédits**:
  - Packs de crédits (ex: 10€ = 100 crédits)
  - Paiement CB via Stripe
  - Crédit du wallet client
- [ ] **Client dépense des crédits**:
  - Abonnement mensuel créateur
  - Tips (pourboires)
  - Messages privés payants
  - Déverrouillage de médias
- [ ] **Créateur reçoit paiements**:
  - Balance interne
  - Demandes de retrait (withdrawals)
  - Transfert vers compte bancaire (Stripe Connect)

#### 3.3 Transactions & Historique
- [ ] Table `transactions` complète (voir `basic-instinct-api.md` §7.12)
- [ ] Historique pour clients et créateurs
- [ ] Dashboard admin avec revenus globaux
- [ ] Exports comptables (CSV, PDF)

---

## 🚀 PHASE 4 — Messagerie Real-time (2-3 semaines)

### Objectif: Chat en temps réel entre créateurs et clients

#### 4.1 WebSockets
- [ ] **Socket.io** intégré au backend
- [ ] Rooms par conversation
- [ ] Events: `message:new`, `message:read`, `typing`
- [ ] Reconnexion automatique

#### 4.2 Features messagerie
- [x] UI Messages déjà faite (Creator Studio)
- [ ] Envoi/réception temps réel
- [ ] Notifications push (Web Push API)
- [ ] Indicateurs "en ligne" / "vu à"
- [ ] Typing indicators
- [ ] Messages médias payants avec blur/unlock
- [ ] Auto-messages configurables (bienvenue, abonnement)

---

## 🚀 PHASE 5 — Notifications & Feed (2 semaines)

### Objectif: Système de notifications et feed d'activité

#### 5.1 Notifications
- [ ] Table `notifications` en DB
- [ ] Types: nouveau message, like, commentaire, abonnement, retrait approuvé
- [ ] Notification push via Socket.io
- [ ] Notification email (SendGrid ou similar)
- [ ] Préférences de notifications par user

#### 5.2 Feed Client
- [x] UI Feed déjà faite (`basic/Feed.tsx`)
- [ ] API `/api/client/feed` avec pagination
- [ ] Algorithme de tri (chronologique / engagement)
- [ ] Infinite scroll
- [ ] Cache avec Redis

---

## 🚀 PHASE 6 — Live Streaming (Optionnel - 3-4 semaines)

### Objectif: Diffusion live pour créateurs

#### 6.1 Infrastructure Live
- [ ] **Choisir solution**:
  - Option A: AWS IVS (Interactive Video Service)
  - Option B: Agora.io
  - Option C: Self-hosted (OBS + RTMP server)
- [ ] Setup RTMP server pour ingest
- [ ] HLS/DASH pour playback
- [ ] Chat live intégré

#### 6.2 Features Live
- [ ] Créateur peut lancer un live
- [ ] Notifications aux abonnés
- [ ] Player vidéo côté client
- [ ] Tips pendant le live
- [ ] Replay enregistré (optionnel)

---

## 🚀 PHASE 7 — Admin & Modération (2 semaines)

### Objectif: Outils admin pour gérer la plateforme

#### 7.1 Admin Features
- [x] UI Admin déjà faite (`/admin`)
- [ ] Connexion routes API
- [ ] Dashboard temps réel (WebSockets pour stats live)
- [ ] Validation KYC manuelle
- [ ] Modération de contenu (approve/reject)
- [ ] Ban/suspend users
- [ ] Gestion des retraits créateurs

#### 7.2 Modération automatique
- [ ] AI Content Moderation (AWS Rekognition, Google Vision API)
- [ ] Détection nudité/violence
- [ ] File d'attente de modération
- [ ] Système de signalement par users

---

## 🚀 PHASE 8 — DevOps & Production (3-4 semaines)

### Objectif: Déploiement et infrastructure scalable

#### 8.1 Containerisation
- [x] Dockerfile déjà présent (racine)
- [ ] Docker Compose pour env local complet
- [ ] Dockerfiles optimisés par app (multi-stage)
- [ ] Docker images pour chaque service (creator-bff, client-bff, admin-bff)

#### 8.2 CI/CD
- [ ] **GitHub Actions**:
  - Tests automatisés
  - Build des 3 apps
  - Push images Docker
  - Deploy auto staging/prod
- [ ] Linting + Prettier
- [ ] Tests unitaires (Vitest)
- [ ] Tests E2E (Playwright)

#### 8.3 Hébergement
- [ ] **Recommandation AWS**:
  - ECS Fargate (containers)
  - RDS PostgreSQL (DB)
  - ElastiCache Redis (cache + sessions)
  - S3 + CloudFront (médias + static)
  - Route53 (DNS)
  - ALB (Load Balancer)
- [ ] Certificats SSL (Let's Encrypt ou AWS ACM)
- [ ] Monitoring (CloudWatch, Sentry)
- [ ] Backups automatiques DB

#### 8.4 Performance
- [ ] Redis pour cache (sessions, feed, analytics)
- [ ] CDN pour assets statiques
- [ ] Lazy loading images
- [ ] Pagination API (cursor-based)
- [ ] Rate limiting par user/IP

---

## 🚀 PHASE 9 — Polish & Launch (2-3 semaines)

### Objectif: Préparation au lancement public

#### 9.1 UI/UX Polish
- [ ] Animations fluides (Framer Motion)
- [ ] Dark mode (optionnel)
- [ ] Accessibility (ARIA, keyboard nav)
- [ ] Mobile responsive 100%
- [ ] Loading states partout
- [ ] Error handling gracieux

#### 9.2 Legal & Compliance
- [ ] CGU / CGV
- [ ] Politique de confidentialité (RGPD)
- [ ] Cookies consent
- [ ] Déclaration CNIL (si FR)
- [ ] Age verification (18+)
- [ ] KYC/AML pour créateurs (vérification identité)

#### 9.3 SEO & Marketing
- [ ] Meta tags (Open Graph, Twitter Cards)
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] Google Analytics / Plausible
- [ ] Landing page publique
- [ ] Programme d'affiliation créateurs

#### 9.4 Testing Final
- [ ] Tests utilisateurs réels
- [ ] Stress tests (load testing avec k6 ou Artillery)
- [ ] Security audit (penetration testing)
- [ ] Bug fixing intensif

---

## 📋 Résumé Chronologique (Estimation)

| Phase | Description | Durée | Statut |
|-------|-------------|-------|--------|
| **✅ Phase 0** | UI des 3 apps + Prisma schema | — | **FAIT** |
| **🟡 Phase 1** | Backend & API Foundation | 4-6 sem | **En cours** |
| Phase 2 | Upload & Stockage Médias | 2-3 sem | À faire |
| Phase 3 | Paiements & Monétisation | 4-5 sem | À faire |
| Phase 4 | Messagerie Real-time | 2-3 sem | À faire |
| Phase 5 | Notifications & Feed | 2 sem | À faire |
| Phase 6 | Live Streaming (optionnel) | 3-4 sem | Optionnel |
| Phase 7 | Admin & Modération | 2 sem | À faire |
| Phase 8 | DevOps & Production | 3-4 sem | À faire |
| Phase 9 | Polish & Launch | 2-3 sem | À faire |

**Durée totale estimée**: 22-30 semaines (5-7 mois) pour un MVP production-ready.

---

## 🎯 Prochaines actions immédiates

### Cette semaine:
1. **Finaliser l'architecture backend** (BFF vs monolithique)
2. **Compléter le schéma Prisma** avec toutes les tables manquantes
3. **Implémenter l'authentification JWT** complète
4. **Créer les routes API prioritaires**:
   - `/api/creator/messages` (CRUD)
   - `/api/creator/library` (upload basique)
   - `/api/client/feed` (lecture seule)

### Ce mois:
1. Finaliser Phase 1 (Backend & API)
2. Commencer Phase 2 (Upload médias avec S3)
3. Setup Docker Compose pour dev local
4. Premiers tests d'intégration frontend-backend

---

## 📦 Stack Technique Confirmée

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Routing**: React Router v6
- **Styling**: TailwindCSS 4
- **State**: React Context (Auth), useState/useEffect
- **Charts**: Recharts (Creator dashboard)
- **Icons**: Lucide React
- **HTTP**: Fetch API (à migrer vers Axios ou TanStack Query)

### Backend
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: SQLite (dev) → PostgreSQL (prod)
- **Auth**: JWT + bcrypt
- **WebSockets**: Socket.io (à implémenter)
- **File Upload**: Multer + AWS SDK (à implémenter)

### Infrastructure
- **Containers**: Docker + Docker Compose
- **Cloud**: AWS (recommandé)
  - ECS Fargate (compute)
  - RDS PostgreSQL (database)
  - S3 + CloudFront (storage + CDN)
  - ElastiCache Redis (cache)
- **Paiements**: Stripe + Stripe Connect
- **CI/CD**: GitHub Actions

---

## 🔗 Documents de référence

- 📄 `basic-instinct-api.md` — Spécifications complètes de l'API et des tables
- 📄 `bff-architecture.md` — Architecture BFF recommandée
- 📄 `PLAN_V2_CREATOR_STUDIO.md` — Plan détaillé Creator Studio (7 semaines)
- 📄 `roadmap.md` (v1) — Roadmap originale (référence historique)

---

## 💡 Notes & Décisions Techniques

### Pourquoi BFF (Backend For Frontend)?
- Isolation des besoins métier par app (creator ≠ client ≠ admin)
- Meilleure sécurité (pas d'exposition de routes admin aux clients)
- Scalabilité indépendante
- Évolution facilitée (changer une app sans casser les autres)

### Pourquoi PostgreSQL en prod?
- SQLite limité en concurrence (write lock)
- Pas de réplication native
- PostgreSQL = standard production (ACID, réplication, backups)

### Pourquoi Stripe Connect?
- Paiements directs aux créateurs (split payments)
- Gestion KYC intégrée
- Conformité réglementaire
- Webhooks robustes

---

**Dernière mise à jour**: 2 mars 2026  
**Version**: 2.0  
**Auteur**: Basic Instinct Team
