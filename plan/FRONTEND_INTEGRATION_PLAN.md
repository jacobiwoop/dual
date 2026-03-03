# 🎨 Plan d'Intégration Frontend - Backend Complet

**Date** : 2 Mars 2026  
**Objectif** : Connecter les 3 applications frontend (Admin, Creator, Client) avec le backend API complet

---

## 📊 État du Backend (100% Ready)

### Routes Disponibles

#### 🔐 Auth Routes (`/api/auth/*`)
- ✅ POST `/register` - Inscription
- ✅ POST `/login` - Connexion
- ✅ POST `/refresh` - Refresh token
- ✅ POST `/logout` - Déconnexion
- ✅ GET `/me` - Profil utilisateur

#### 👨‍💼 Admin Routes (`/api/admin/*`)
**Dashboard**
- ✅ GET `/dashboard` - Stats globales
- ✅ GET `/logs` - Logs système
- ✅ GET `/settings` - Paramètres plateforme
- ✅ PUT `/settings/:key` - Modifier paramètre

**Creators Management**
- ✅ GET `/creators` - Liste créateurs
- ✅ GET `/creators/:id` - Détails créateur
- ✅ PUT `/creators/:id/verify` - Vérifier créateur
- ✅ PUT `/creators/:id/suspend` - Suspendre créateur
- ✅ PUT `/creators/:id/kyc` - Mettre à jour KYC
- ✅ GET `/creators/:id/analytics` - Analytics créateur

**Moderation**
- ✅ GET `/moderation/posts` - Posts à modérer
- ✅ PUT `/moderation/posts/:id` - Modérer post
- ✅ GET `/moderation/media` - Médias à modérer
- ✅ PUT `/moderation/media/:id` - Modérer média
- ✅ GET `/moderation/stats` - Stats modération

**Transactions**
- ✅ GET `/transactions` - Liste transactions
- ✅ GET `/revenue/stats` - Stats revenus
- ✅ GET `/revenue/by-creator` - Revenus par créateur
- ✅ GET `/revenue/chart` - Graphique revenus

**Withdrawals**
- ✅ GET `/withdrawals` - Liste retraits
- ✅ GET `/withdrawals/:id` - Détails retrait
- ✅ PUT `/withdrawals/:id/approve` - Approuver retrait
- ✅ PUT `/withdrawals/:id/reject` - Rejeter retrait
- ✅ GET `/withdrawals/stats` - Stats retraits

**Payments (Admin)**
- ✅ GET `/payments/requests` - Demandes d'achat
- ✅ PUT `/payments/requests/:id/approve` - Approuver achat
- ✅ PUT `/payments/requests/:id/reject` - Rejeter achat

#### 🎨 Creator Routes (`/api/creator/*`)
**Messages**
- ✅ GET `/conversations` - Liste conversations
- ✅ GET `/conversations/:clientId/messages` - Messages conversation
- ✅ POST `/conversations/:clientId/messages` - Envoyer message
- ✅ PUT `/conversations/:clientId/read` - Marquer comme lu
- ✅ GET `/conversations/:clientId/info` - Info client
- ✅ POST `/notes/:clientId` - Sauvegarder note

**Library (Bibliothèque)**
- ✅ GET `/library` - Liste items
- ✅ POST `/library` - Créer item
- ✅ DELETE `/library/:id` - Supprimer item
- ✅ PUT `/library/:id/move` - Déplacer item
- ✅ GET `/library/stats` - Stats bibliothèque
- ✅ GET `/library/folders` - Liste dossiers
- ✅ POST `/library/folders` - Créer dossier
- ✅ PUT `/library/folders/:id` - Modifier dossier
- ✅ DELETE `/library/folders/:id` - Supprimer dossier

**Profile**
- ✅ GET `/profile` - Profil créateur
- ✅ PUT `/profile` - Mettre à jour profil
- ✅ POST `/profile/avatar` - Mettre à jour avatar
- ✅ POST `/profile/banner` - Mettre à jour bannière
- ✅ PUT `/profile/payout-settings` - Paramètres de paiement

**Payouts (Retraits)**
- ✅ POST `/payouts/request` - Demander retrait
- ✅ GET `/payouts/history` - Historique retraits

**Analytics**
- ✅ GET `/analytics/overview` - Vue d'ensemble
- ✅ GET `/analytics/revenue` - Graphique revenus
- ✅ GET `/analytics/subscribers` - Graphique abonnés
- ✅ GET `/analytics/top-clients` - Top clients
- ✅ GET `/analytics/stats` - Statistiques

**Media (Upload R2)**
- ✅ POST `/media/upload-url` - Obtenir signed URL
- ✅ POST `/media/confirm` - Confirmer upload
- ✅ GET `/media/library` - Liste médias
- ✅ DELETE `/media/:id` - Supprimer média

#### 👤 Client Routes (`/api/client/*`)
**Feed & Posts**
- ✅ GET `/feed` - Feed personnalisé
- ✅ GET `/posts/:id` - Détails post
- ✅ POST `/posts/:id/like` - Liker post
- ✅ POST `/posts/:id/comment` - Commenter post
- ✅ GET `/posts/:id/comments` - Liste commentaires

**Creators (Explore)**
- ✅ GET `/creators` - Liste créateurs
- ✅ GET `/creators/:username` - Profil créateur
- ✅ GET `/creators/:username/posts` - Posts créateur
- ✅ GET `/creators/:username/galleries` - Galeries créateur
- ✅ POST `/creators/:id/subscribe` - S'abonner
- ✅ DELETE `/creators/:id/subscribe` - Se désabonner

**Messages**
- ✅ GET `/conversations` - Liste conversations
- ✅ GET `/conversations/:creatorId/messages` - Messages conversation
- ✅ POST `/conversations/:creatorId/messages` - Envoyer message
- ✅ POST `/messages/:id/unlock` - Déverrouiller message payant

**Credits**
- ✅ GET `/credits/balance` - Solde crédits
- ✅ POST `/credits/purchase` - Acheter crédits
- ✅ GET `/credits/history` - Historique transactions
- ✅ GET `/credits/packs` - Packs disponibles

**Payments**
- ✅ POST `/payments/buy-coins` - Acheter coins
- ✅ GET `/payments/history` - Historique achats

#### ⚡ WebSocket Events (Socket.io)
**Client → Server**
- ✅ `conversation:join` - Rejoindre conversation
- ✅ `conversation:leave` - Quitter conversation
- ✅ `message:send` - Envoyer message
- ✅ `message:read` - Marquer comme lu
- ✅ `typing:start` - Commencer à taper
- ✅ `typing:stop` - Arrêter de taper
- ✅ `user:online` - En ligne

**Server → Client**
- ✅ `message:new` - Nouveau message
- ✅ `message:read` - Message lu
- ✅ `notification:new-message` - Notification
- ✅ `typing:user` - Utilisateur tape
- ✅ `user:online` - Utilisateur en ligne
- ✅ `user:offline` - Utilisateur hors ligne

---

## 🎯 Plan d'Intégration par Application

### 1️⃣ Admin App (`admin/`) - Priority: MEDIUM

#### Status Actuel
- ✅ Pages existantes : Dashboard, Creators, Transactions, Withdrawals, etc.
- ⏳ Connexion API : Données mockées
- ⏳ Authentification : À implémenter

#### Intégration Requise

**Phase Admin.1 - Authentification (1 session)**
- [ ] Service API (`src/services/api.ts`)
- [ ] Hook useAuth avec JWT
- [ ] Login page connexion
- [ ] Token management (localStorage)
- [ ] Protected routes

**Phase Admin.2 - Dashboard (1 session)**
- [ ] Connecter `/admin/dashboard`
- [ ] Stats en temps réel
- [ ] Graphiques revenus
- [ ] Activité récente

**Phase Admin.3 - Creators Management (1 session)**
- [ ] Liste créateurs
- [ ] Détails créateur
- [ ] Actions (verify, suspend, KYC)
- [ ] Analytics créateur

**Phase Admin.4 - Moderation (1 session)**
- [ ] Posts à modérer
- [ ] Médias à modérer
- [ ] Actions modération
- [ ] Stats

**Phase Admin.5 - Transactions & Withdrawals (1 session)**
- [ ] Liste transactions
- [ ] Graphiques revenus
- [ ] Retraits (approve/reject)
- [ ] Stats

**Progression Admin** : 0% → 100% (5 sessions)

---

### 2️⃣ Creator Studio (`creator/`) - Priority: HIGH

#### Status Actuel
- ✅ Pages existantes : Dashboard, Messages, Library, Media, Profile, etc.
- ⏳ Connexion API : Données mockées
- ✅ AuthContext existe
- ⏳ WebSocket : À implémenter

#### Intégration Requise

**Phase Creator.1 - Authentification (1 session)**
- [ ] Service API (`src/services/api.ts`)
- [ ] Connecter AuthContext au backend
- [ ] Login/Register pages
- [ ] Token refresh automatique
- [ ] Protected routes

**Phase Creator.2 - Dashboard & Analytics (1 session)**
- [ ] Connecter `/creator/analytics/overview`
- [ ] Stats temps réel
- [ ] Graphiques revenus/abonnés
- [ ] Top clients

**Phase Creator.3 - Messages WebSocket (2 sessions)**
- [ ] SocketContext création
- [ ] Hook useSocket
- [ ] Hook useMessages
- [ ] Messages.tsx refactoring
- [ ] Typing indicators
- [ ] Online/offline status
- [ ] Real-time updates

**Phase Creator.4 - Library & Media Upload (1 session)**
- [ ] Liste bibliothèque
- [ ] Upload vers R2 (signed URLs)
- [ ] Folders management
- [ ] Preview médias
- [ ] Confirm upload flow

**Phase Creator.5 - Profile Management (1 session)**
- [ ] Afficher profil
- [ ] Éditer profil
- [ ] Upload avatar/banner
- [ ] Payout settings

**Phase Creator.6 - Payouts (1 session)**
- [ ] Demander retrait
- [ ] Historique retraits
- [ ] Balance display

**Progression Creator** : 0% → 100% (7 sessions)

---

### 3️⃣ Client App (`basic/`) - Priority: HIGH

#### Status Actuel
- ✅ Pages existantes : Home, Explore, Messages, Profile, Credits
- ⏳ Connexion API : Données mockées
- ⏳ Authentification : À implémenter

#### Intégration Requise

**Phase Client.1 - Authentification (1 session)**
- [ ] Service API (`src/services/api.ts`)
- [ ] Context AuthContext
- [ ] Login/Register pages
- [ ] Token management
- [ ] Protected routes

**Phase Client.2 - Explore & Creators (1 session)**
- [ ] Liste créateurs
- [ ] Profil créateur
- [ ] Posts créateur
- [ ] Subscribe/Unsubscribe
- [ ] Galeries

**Phase Client.3 - Feed (1 session)**
- [ ] Feed personnalisé
- [ ] Like post
- [ ] Commenter post
- [ ] Infinite scroll

**Phase Client.4 - Messages WebSocket (2 sessions)**
- [ ] SocketContext création
- [ ] Hook useSocket
- [ ] Hook useMessages
- [ ] MessagesPage.tsx refactoring
- [ ] Typing indicators
- [ ] Real-time messages
- [ ] Unlock paid media

**Phase Client.5 - Credits & Payments (1 session)**
- [ ] Balance display
- [ ] Buy credits flow
- [ ] Packs disponibles
- [ ] Historique transactions

**Progression Client** : 0% → 100% (6 sessions)

---

## 📊 Résumé de la Progression

| Application | Backend Ready | Frontend Status | Sessions Requises | Priority |
|-------------|---------------|-----------------|-------------------|----------|
| **Admin** | ✅ 100% | ⏳ 0% | 5 sessions | MEDIUM |
| **Creator** | ✅ 100% | ⏳ 0% | 7 sessions | HIGH |
| **Client** | ✅ 100% | ⏳ 0% | 6 sessions | HIGH |
| **TOTAL** | ✅ 100% | ⏳ 0% | **18 sessions** | - |

---

## 🎯 Ordre d'Implémentation Recommandé

### Semaine 1 - Foundation (Auth + Core)
**Jour 1-2 : Authentification Partout**
1. Creator.1 - Auth (Creator Studio)
2. Client.1 - Auth (Client App)
3. Admin.1 - Auth (Admin)

**Jour 3-4 : Core Features**
4. Creator.2 - Dashboard & Analytics
5. Client.2 - Explore & Creators
6. Admin.2 - Dashboard

### Semaine 2 - Messages Real-time (Priority!)
**Jour 5-7 : WebSocket Integration**
7. Creator.3 - Messages WebSocket (2 sessions)
8. Client.4 - Messages WebSocket (2 sessions)

### Semaine 3 - Remaining Features
**Jour 8-10 : Creator Features**
9. Creator.4 - Library & Media
10. Creator.5 - Profile
11. Creator.6 - Payouts

**Jour 11-12 : Client Features**
12. Client.3 - Feed
13. Client.5 - Credits & Payments

**Jour 13-14 : Admin Features**
14. Admin.3 - Creators Management
15. Admin.4 - Moderation
16. Admin.5 - Transactions & Withdrawals

### Semaine 4 - Polish & Testing
**Jour 15-18 : Tests & Optimizations**
- Tests end-to-end
- Bug fixes
- UI/UX polish
- Performance optimizations

---

## 🛠️ Stack Technique Frontend

### Technologies Communes
- **React** 18.x
- **TypeScript**
- **Vite** (build tool)
- **TailwindCSS** (styling)

### Libraries À Ajouter
```bash
# Toutes les apps
npm install axios socket.io-client
npm install @tanstack/react-query  # Pour cache API
npm install zustand                # État global (optionnel)
npm install react-hook-form        # Formulaires
npm install zod                    # Validation
```

### Structure Recommandée (par app)
```
src/
├─ services/
│  ├─ api.ts           # Axios instance + interceptors
│  └─ socket.ts        # Socket.io client
├─ contexts/
│  ├─ AuthContext.tsx
│  └─ SocketContext.tsx
├─ hooks/
│  ├─ useAuth.ts
│  ├─ useSocket.ts
│  ├─ useMessages.ts
│  └─ useApi.ts
├─ types/
│  └─ api.ts          # Types Backend
└─ utils/
   └─ constants.ts    # API_URL, etc.
```

---

## 📝 Fichiers de Tracking

Pour suivre la progression, je vais créer :

```
plan/frontend-integration/
├─ ADMIN_INTEGRATION.md      # Progression Admin
├─ CREATOR_INTEGRATION.md    # Progression Creator
├─ CLIENT_INTEGRATION.md     # Progression Client
└─ GLOBAL_STATUS.md          # Vue d'ensemble
```

Chaque fichier contiendra :
- ✅ Sessions complétées
- 🔄 Session en cours
- ⏳ Sessions à venir
- 📝 Code snippets
- 🐛 Problèmes rencontrés
- 📊 % de progression

---

## ❓ Prochaine Étape

**Quelle application voulez-vous intégrer en premier ?**

1. **Creator Studio** (HIGH priority) - Messages WebSocket + Upload
2. **Client App** (HIGH priority) - Explore + Messages
3. **Admin** (MEDIUM priority) - Dashboard + Management

**Ma recommandation** : Commencer par **Creator Studio** car :
- C'est le plus critique (créateurs doivent répondre)
- Messages WebSocket sont prioritaires
- Upload R2 déjà fait backend

**Confirmez votre choix et je crée le plan détaillé de la première session ! 🚀**
