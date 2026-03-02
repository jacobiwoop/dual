# 📋 PLAN V2 - BASIC INSTINCT CREATOR STUDIO
**Version 2.0 - Adapté à l'existant**
*Mis à jour: 2 Mars 2026*

---

## 🎯 VISION DU PROJET

Créer une **plateforme complète de gestion pour créateurs de contenu** permettant de:
- Gérer leur bibliothèque de contenu (photos/vidéos)
- Communiquer avec leurs abonnés via messagerie privée
- Monétiser leur contenu (abonnements, médias payants, demandes custom)
- Suivre leurs revenus et analytics
- Automatiser certaines tâches (messages auto, réponses)

---

## ✅ ÉTAT ACTUEL (Ce qui est DÉJÀ fait)

### 🟢 BACKEND (30% complet)
- [x] **Architecture Express.js** configurée
- [x] **Base de données Prisma + SQLite** avec 7 modèles:
  - User (authentification, profil, rôle)
  - Conversation / ConversationParticipant
  - Message / MessageMedia
  - LibraryFolder / LibraryItem
- [x] **Authentification JWT complète**:
  - Route `/api/auth/register`
  - Route `/api/auth/login`
  - Hachage bcrypt
  - Tokens JWT (7 jours)
- [x] **Middleware CORS**
- [x] **Gestion d'erreurs globale**

### 🟢 FRONTEND (90% UI complet, 10% connecté)
- [x] **20 composants React** créés
- [x] **AuthContext** pour gestion de l'état auth
- [x] **ProtectedRoute** pour sécuriser les pages
- [x] **Pages principales**:
  - Dashboard (analytics avec recharts)
  - Profile (édition profil créateur)
  - Library (gestion de bibliothèque + folders)
  - Messages (conversations + médias payants)
  - Requests (demandes spéciales)
  - Settings (auto-messages, paiements, compte)
  - Media (galerie)
- [x] **Composants modaux**:
  - Auth (connexion/inscription)
  - UploadMedia
  - MessageMedia
  - ClientNotes
  - CreateShow
  - Withdraw
  - EditGallery
  - AutoMessage
  - CropModal
- [x] **Sidebars** (gauche: navigation, droite: conversations)
- [x] **Responsive design** (mobile + desktop)
- [x] **Design system** cohérent (TailwindCSS)

### 🔴 CE QUI MANQUE (60% à faire)

#### Backend API (manque 70%)
- [ ] Routes CRUD pour:
  - Messages (`/api/messages`)
  - Conversations (`/api/conversations`)
  - Library items (`/api/library`)
  - Library folders (`/api/library/folders`)
  - User profile (`/api/users/:id`)
  - Requests (`/api/requests`)
- [ ] Middleware d'authentification (vérifier JWT sur routes protégées)
- [ ] Upload de fichiers (multer + stockage)
- [ ] WebSocket pour messagerie temps réel
- [ ] Système de paiements (Stripe/PayPal)
- [ ] Notifications

#### Frontend-Backend connection (manque 90%)
- [ ] Remplacer mockData par appels API
- [ ] Hooks personnalisés (useMessages, useLibrary, etc.)
- [ ] Optimistic updates
- [ ] Cache et invalidation (React Query/SWR)
- [ ] Upload réel de fichiers
- [ ] WebSocket client

---

## 🗓️ PLAN DE DÉVELOPPEMENT V2

### 📦 PHASE 1: API BACKEND (2-3 semaines)
**Objectif:** Compléter toutes les routes backend nécessaires

#### Semaine 1: Messages & Conversations
- [ ] **1.1** Créer contrôleur `conversation.controller.ts`
  - `GET /api/conversations` - Liste des conversations de l'utilisateur
  - `GET /api/conversations/:id` - Détails d'une conversation
  - `POST /api/conversations` - Créer une conversation
  - `GET /api/conversations/:id/messages` - Messages d'une conversation
  
- [ ] **1.2** Créer contrôleur `message.controller.ts`
  - `POST /api/messages` - Envoyer un message
  - `PATCH /api/messages/:id/unlock` - Déverrouiller un message payant
  - `DELETE /api/messages/:id` - Supprimer un message

- [ ] **1.3** Ajouter middleware `auth.middleware.ts`
  - Vérifier token JWT
  - Attacher user à req.user
  - Gérer erreurs 401/403

- [ ] **1.4** Tester routes avec Postman/Thunder Client

#### Semaine 2: Library & Media
- [ ] **2.1** Créer contrôleur `library.controller.ts`
  - `GET /api/library/folders` - Liste des dossiers
  - `POST /api/library/folders` - Créer un dossier
  - `PATCH /api/library/folders/:id` - Modifier un dossier
  - `DELETE /api/library/folders/:id` - Supprimer un dossier
  - `GET /api/library/items` - Liste des items (avec filtres)
  - `POST /api/library/items` - Ajouter un item
  - `DELETE /api/library/items/:id` - Supprimer un item

- [ ] **2.2** Implémenter upload de fichiers
  - Installer multer
  - Créer dossier `uploads/`
  - Route `POST /api/upload` (images/vidéos)
  - Validation (types, taille max)
  - Compression d'images (sharp)
  - Génération de thumbnails

- [ ] **2.3** Servir fichiers statiques
  - Configurer Express pour `/uploads`
  - Sécuriser l'accès (vérifier ownership)

#### Semaine 3: User Profile & Requests
- [ ] **3.1** Créer contrôleur `user.controller.ts`
  - `GET /api/users/me` - Profil actuel
  - `PATCH /api/users/me` - Modifier profil
  - `PATCH /api/users/me/avatar` - Changer avatar
  - `PATCH /api/users/me/banner` - Changer bannière
  - `GET /api/users/:id` - Profil public

- [ ] **3.2** Créer modèle `Request` dans Prisma
  ```prisma
  model Request {
    id          String   @id @default(uuid())
    clientId    String
    creatorId   String
    type        String   // "custom_content", "video_call", etc.
    description String
    budget      Float
    status      String   // "pending", "accepted", "rejected", "completed"
    createdAt   DateTime @default(now())
    
    client      User     @relation("RequestClient", fields: [clientId], references: [id])
    creator     User     @relation("RequestCreator", fields: [creatorId], references: [id])
  }
  ```

- [ ] **3.3** Créer contrôleur `request.controller.ts`
  - `GET /api/requests` - Liste des demandes
  - `POST /api/requests` - Créer une demande
  - `PATCH /api/requests/:id/accept` - Accepter
  - `PATCH /api/requests/:id/reject` - Refuser
  - `PATCH /api/requests/:id/complete` - Marquer complété

- [ ] **3.4** Migrer la base de données
  ```bash
  npx prisma migrate dev --name add_requests
  ```

### 📡 PHASE 2: CONNEXION FRONTEND (2 semaines)

#### Semaine 4: Hooks & Services
- [ ] **4.1** Créer `src/services/api.ts`
  ```typescript
  // Client HTTP centralisé avec axios
  // Gestion automatique des tokens
  // Intercepteurs pour erreurs
  ```

- [ ] **4.2** Créer hooks personnalisés dans `src/hooks/`
  - `useConversations.ts`
  - `useMessages.ts`
  - `useLibrary.ts`
  - `useProfile.ts`
  - `useRequests.ts`

- [ ] **4.3** Installer React Query
  ```bash
  npm install @tanstack/react-query
  ```

- [ ] **4.4** Configurer React Query
  - QueryClient
  - Cache invalidation
  - Optimistic updates

#### Semaine 5: Remplacement mockData
- [ ] **5.1** Dashboard
  - Remplacer MOCK_STATS par vraies données API
  - Graphiques avec vraies transactions
  - KPI dynamiques

- [ ] **5.2** Messages
  - Charger conversations depuis API
  - Envoyer messages via API
  - Afficher médias depuis serveur

- [ ] **5.3** Library
  - Charger folders/items depuis API
  - Upload réel de fichiers
  - Delete/Edit avec API

- [ ] **5.4** Profile
  - Charger profil depuis API
  - Update profil via API
  - Upload avatar/banner

- [ ] **5.5** Requests
  - Charger demandes depuis API
  - Actions (accept/reject) via API

### 🔄 PHASE 3: TEMPS RÉEL & OPTIMISATIONS (1-2 semaines)

#### Semaine 6: WebSocket
- [ ] **6.1** Installer Socket.io
  ```bash
  npm install socket.io socket.io-client
  ```

- [ ] **6.2** Backend WebSocket
  - Configurer Socket.io dans server.ts
  - Events: `message:new`, `message:read`, `user:online`
  - Authentification WebSocket (JWT)

- [ ] **6.3** Frontend WebSocket
  - Créer `src/lib/socket.ts`
  - Hook `useSocket`
  - Intégrer dans Messages component
  - Notifications en temps réel

#### Semaine 7: Paiements (optionnel)
- [ ] **7.1** Intégrer Stripe
  - Créer compte Stripe
  - Installer SDK
  - Routes `/api/payments/*`

- [ ] **7.2** Fonctionnalités
  - Acheter message payant
  - Abonnements mensuels
  - Withdrawals (retraits)

### 🎨 PHASE 4: POLISH & PRODUCTION (1 semaine)

#### Semaine 8: Finitions
- [ ] **8.1** Tests
  - Tests unitaires (Vitest)
  - Tests d'intégration API
  - Tests E2E (Playwright)

- [ ] **8.2** Sécurité
  - Rate limiting (express-rate-limit)
  - Helmet.js
  - CSRF protection
  - XSS prevention
  - SQL injection (déjà géré par Prisma)

- [ ] **8.3** Performance
  - Compression (gzip)
  - Caching (Redis optionnel)
  - Lazy loading images
  - Code splitting

- [ ] **8.4** Déploiement
  - Variables d'environnement
  - Build production
  - Dockerisation
  - CI/CD (GitHub Actions)
  - Hébergement (Railway, Render, Vercel)

---

## 📊 STRUCTURE DES FICHIERS (Cible finale)

```
creator/
├── prisma/
│   ├── schema.prisma          ✅ Fait
│   └── migrations/            ✅ Fait
├── src/
│   ├── server.ts              ✅ Fait (base)
│   ├── controllers/
│   │   ├── auth.controller.ts     ✅ Fait
│   │   ├── conversation.controller.ts  ❌ À faire
│   │   ├── message.controller.ts       ❌ À faire
│   │   ├── library.controller.ts       ❌ À faire
│   │   ├── user.controller.ts          ❌ À faire
│   │   └── request.controller.ts       ❌ À faire
│   ├── routes/
│   │   ├── auth.routes.ts      ✅ Fait
│   │   ├── conversation.routes.ts  ❌ À faire
│   │   ├── message.routes.ts       ❌ À faire
│   │   ├── library.routes.ts       ❌ À faire
│   │   ├── user.routes.ts          ❌ À faire
│   │   └── request.routes.ts       ❌ À faire
│   ├── middleware/
│   │   ├── auth.middleware.ts   ❌ À faire
│   │   ├── upload.middleware.ts ❌ À faire
│   │   └── error.middleware.ts  ❌ À faire
│   ├── services/
│   │   └── api.ts              ❌ À faire (frontend)
│   ├── hooks/
│   │   ├── useConversations.ts ❌ À faire
│   │   ├── useMessages.ts      ❌ À faire
│   │   ├── useLibrary.ts       ❌ À faire
│   │   └── useProfile.ts       ❌ À faire
│   ├── context/
│   │   └── AuthContext.tsx     ✅ Fait
│   ├── components/            ✅ Fait (20 composants)
│   ├── lib/
│   │   ├── prisma.ts           ✅ Fait
│   │   ├── socket.ts           ❌ À faire
│   │   └── utils.ts            ✅ Fait
│   └── data/
│       └── mockData.ts         ⚠️ À remplacer
├── uploads/                    ❌ À créer
├── .env                        ✅ Fait
└── package.json                ✅ Fait
```

---

## 🎯 PRIORITÉS

### 🔥 HAUTE PRIORITÉ (MVP)
1. ✅ Authentification (FAIT)
2. 🔨 API Messages & Conversations
3. 🔨 Connexion Messages frontend ↔ backend
4. 🔨 API Library + Upload fichiers
5. 🔨 Connexion Library frontend ↔ backend

### 🟡 PRIORITÉ MOYENNE
6. 🔨 API User Profile
7. 🔨 API Requests
8. 🔨 WebSocket temps réel
9. 🔨 Dashboard avec vraies données

### 🟢 BASSE PRIORITÉ (Post-MVP)
10. 🔨 Paiements Stripe
11. 🔨 Notifications push
12. 🔨 Analytics avancées
13. 🔨 Admin panel

---

## 📈 MÉTRIQUES DE SUCCÈS

### Étape 1 (MVP - 4 semaines)
- [x] Auth fonctionne ✅
- [ ] User peut créer un compte créateur
- [ ] User peut uploader des photos/vidéos
- [ ] User peut créer des dossiers
- [ ] User peut envoyer des messages
- [ ] User peut voir ses conversations

### Étape 2 (V1 - 6 semaines)
- [ ] Messagerie temps réel (WebSocket)
- [ ] Upload optimisé (compression, thumbnails)
- [ ] Dashboard avec vraies analytics
- [ ] Gestion de demandes custom

### Étape 3 (V2 - 8 semaines)
- [ ] Paiements fonctionnels
- [ ] Médias payants
- [ ] Retraits
- [ ] Messages automatiques

---

## 🛠️ TECHNOLOGIES UTILISÉES

### Backend
- Node.js + Express.js
- Prisma ORM
- SQLite (dev) → PostgreSQL (prod recommandé)
- JWT + bcrypt
- Multer (upload)
- Socket.io (WebSocket)
- Stripe SDK (paiements)

### Frontend
- React 19 + TypeScript
- React Router v7
- TailwindCSS 4.1
- React Query (cache)
- Recharts (graphiques)
- React Dropzone (upload)
- date-fns (dates)

### DevOps
- Vite (bundler)
- ESLint + Prettier
- Vitest (tests)
- Docker
- GitHub Actions (CI/CD)

---

## 🚨 RISQUES & MITIGATION

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Upload de gros fichiers lent | Élevé | Haute | Compression, CDN, chunked upload |
| Coût stockage fichiers | Moyen | Moyenne | Limites par user, nettoyage auto |
| Spam dans messages | Élevé | Moyenne | Rate limiting, modération |
| Scalabilité WebSocket | Élevé | Basse | Redis adapter pour Socket.io |
| Frais Stripe élevés | Moyen | Haute | Passer minimum 5€, négocier fees |

---

## 📝 NOTES IMPORTANTES

1. **Migration de SQLite vers PostgreSQL** recommandée pour prod
2. **Stockage fichiers** : Utiliser S3/Cloudflare R2 en prod (pas uploads/ local)
3. **Sécurité** : Ne JAMAIS commit .env, changer JWT_SECRET en prod
4. **Performance** : Ajouter indexes Prisma sur champs recherchés souvent
5. **Legal** : Ajouter CGU, politique confidentialité, modération contenu

---

## 🎓 RESSOURCES

- [Prisma Docs](https://www.prisma.io/docs)
- [Socket.io Docs](https://socket.io/docs/v4/)
- [Stripe Docs](https://stripe.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Dernière mise à jour:** 2 Mars 2026
**Prochaine révision:** Après Phase 1 (fin Semaine 3)

