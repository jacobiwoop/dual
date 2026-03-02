# 🗺️ Basic Instinct — Roadmap & Checklist

> Les étapes dans l'ordre pour tout mettre en place
> ✅ = fait · 🔄 = en cours · ⬜ = à faire

---

## PHASE 0 — Prérequis & Setup

- ⬜ Installer Docker Desktop (pour Redis uniquement pour l'instant)
- ⬜ Lancer Redis via Docker
  ```bash
  docker run -d --name bi-redis -p 6379:6379 redis:7-alpine
  ```
- ⬜ Vérifier que Redis répond
  ```bash
  docker exec -it bi-redis redis-cli ping
  # → PONG
  ```

---

## PHASE 1 — basic-instinct-api

> Le cœur de tout. Rien d'autre ne peut fonctionner sans l'API.

### 1.1 Setup projet

- ⬜ Créer le projet Node.js + Express + TypeScript
- ⬜ Configurer `tsconfig.json`
- ⬜ Installer les dépendances (express, prisma, zod, jsonwebtoken, ioredis, socket.io...)
- ⬜ Créer le fichier `.env` à partir du `.env.example`
- ⬜ Connecter Redis (`lib/redis.ts`)

### 1.2 Base de données (Prisma + SQLite)

- ⬜ Initialiser Prisma (`npx prisma init`)
- ⬜ Écrire le `schema.prisma` complet (21 tables)
- ⬜ Lancer la première migration (`npx prisma migrate dev`)
- ⬜ Créer le seed de données de test (`prisma/seed.ts`)
- ⬜ Vérifier avec Prisma Studio (`npx prisma studio`)

### 1.3 Auth

- ⬜ `POST /auth/register` — créer un compte
- ⬜ `POST /auth/login` — connexion + JWT + refresh token dans Redis
- ⬜ `POST /auth/refresh` — renouveler l'access token
- ⬜ `POST /auth/logout` — supprimer le refresh token de Redis
- ⬜ `POST /auth/forgot-password`
- ⬜ `POST /auth/reset-password`
- ⬜ `GET  /auth/me`
- ⬜ Middleware `requireAuth()`
- ⬜ Middleware `requireRole()`

### 1.4 Profils

- ⬜ CRUD profil créateur (`/creator/profile`)
- ⬜ CRUD profil client (`/client/profile`)
- ⬜ Profils publics créateurs (`/explore/creators`)

### 1.5 Cloudflare R2 — Upload fichiers

- ⬜ Créer un compte Cloudflare (gratuit)
- ⬜ Créer les 3 buckets R2 (`bi-media-public`, `bi-media-private`, `bi-avatars`)
- ⬜ Récupérer les credentials R2 et les mettre dans `.env`
- ⬜ Configurer le client R2 (`lib/r2.ts`)
- ⬜ Service génération URLs pré-signées (`services/upload.service.ts`)
- ⬜ Routes upload avatar / couverture profil
- ⬜ Routes upload médias bibliothèque

### 1.6 Médias & Galeries

- ⬜ CRUD médias (`/creator/media`)
- ⬜ CRUD galeries (`/creator/galleries`)
- ⬜ CRUD bibliothèque + dossiers (`/creator/library`)
- ⬜ Routes accès médias côté client (selon abonnement)

### 1.7 Messages & Temps réel

- ⬜ Configurer Socket.io + Redis pub/sub
- ⬜ Rooms Socket.io (`creator:{id}`, `client:{id}`)
- ⬜ CRUD conversations + messages (`/creator/conversations`)
- ⬜ Événements temps réel (`message:new`, `message:read`)
- ⬜ Présence en ligne (`user:online`, `user:offline`)
- ⬜ Notes privées créateur sur clients

### 1.8 Abonnements & Crédits

- ⬜ Système de crédits simulé (sans Stripe)
- ⬜ Route dev `/dev/credits/add` pour créditer manuellement
- ⬜ CRUD abonnements (`/client/subscriptions`)
- ⬜ Transaction atomique Prisma (débit client + crédit créateur + commission)

### 1.9 Transactions & Achats

- ⬜ Achat média (`/client/purchases/media/:id`)
- ⬜ Achat galerie (`/client/purchases/gallery/:id`)
- ⬜ Déblocage média dans message (`/client/messages/:id/purchase`)
- ⬜ Tips (`/client/tips`)
- ⬜ Historique transactions

### 1.10 Demandes spéciales & Shows

- ⬜ CRUD types de shows créateur
- ⬜ CRUD demandes spéciales (client → créateur)
- ⬜ Accept / Refuse demande

### 1.11 Messages automatiques

- ⬜ CRUD messages automatiques (`/creator/auto-messages`)
- ⬜ Service déclenchement auto (`services/auto-message.service.ts`)

### 1.12 Finances créateur

- ⬜ Solde + historique transactions
- ⬜ Demande de retrait (`/creator/withdrawals`)
- ⬜ IBAN chiffré (AES-256)

### 1.13 KYC

- ⬜ Upload documents KYC (bucket R2 privé)
- ⬜ Soumission + statut (`/creator/kyc`)

### 1.14 Signalements

- ⬜ Signaler un contenu/profil (`POST /reports`)
- ⬜ Auto-masquage contenu si signalement critique

### 1.15 Notifications

- ⬜ Créer une notification en base
- ⬜ Routes lecture/marquage lu (`/notifications`)
- ⬜ Événement Socket.io à chaque notification

### 1.16 Routes Admin

- ⬜ Stats globales plateforme
- ⬜ Gestion créateurs (suspend, ban, KYC review)
- ⬜ Gestion clients (suspend, ban)
- ⬜ File de modération (signalements)
- ⬜ Validation retraits
- ⬜ Commissions
- ⬜ Paramètres plateforme
- ⬜ Audit logs
- ⬜ Gestion équipe admin

### 1.17 Stats & Dashboard

- ⬜ KPIs créateur (revenus, abonnés, ventes)
- ⬜ KPIs admin (plateforme globale)

### 1.18 Emails (Resend)

- ⬜ Créer un compte Resend (gratuit jusqu'à 3000 emails/mois)
- ⬜ Configurer `services/email.service.ts`
- ⬜ Templates : bienvenue, KYC, retrait, suspension, reset password

### 1.19 Tâches cron

- ⬜ Renouvellement abonnements automatique
- ⬜ Déclenchement messages auto inactivité (7 jours)
- ⬜ Nettoyage fichiers R2 orphelins

---

## PHASE 2 — BFF basic-instinct (client public)

> Proxy sécurisé devant le frontend client

- ⬜ Créer le dossier `server/` dans `basic-instinct/`
- ⬜ Setup Express + TypeScript dans `server/`
- ⬜ Installer `http-proxy-middleware`, `cookie-parser`
- ⬜ Route `POST /auth/login` → stocke token dans cookie httpOnly
- ⬜ Route `POST /auth/logout` → supprime le cookie
- ⬜ Middleware proxy `/api/*` → forward vers `basic-instinct-api:4000`
- ⬜ Middleware auth → bloque si pas de cookie session
- ⬜ Servir le build React (`client/dist`) en prod
- ⬜ Tester login → cookie posé → requêtes API proxifiées

---

## PHASE 3 — BFF basic-instinct-studio (créateur)

- ⬜ Créer le dossier `server/` dans `basic-instinct-studio/`
- ⬜ Même setup que le BFF client (copier/adapter)
- ⬜ Middleware auth → redirect `/login` si pas de session
- ⬜ Vérification rôle `creator` avant de forwarder
- ⬜ Tester toutes les pages studio avec l'API réelle

---

## PHASE 4 — basic-instinct-admin (frontend + BFF)

### 4.1 BFF Admin

- ⬜ Créer le dossier `server/` dans `basic-instinct-admin/`
- ⬜ Même setup BFF + vérification rôle `admin`
- ⬜ Middleware strict : toute requête sans session admin → redirect login

### 4.2 Frontend Admin (React + TypeScript)

- ⬜ Setup Vite + React + TypeScript + Tailwind v4
- ⬜ Layout global (SidebarLeft 240px + Topbar + contenu)
- ⬜ SidebarLeft avec navigation + badges alertes
- ⬜ Page Dashboard (`/dashboard`)
- ⬜ Page Créateurs (`/creators`) + Fiche créateur
- ⬜ Page Clients (`/clients`) + Fiche client
- ⬜ Page Modération (`/moderation`)
- ⬜ Page Médias (`/media`)
- ⬜ Page Transactions (`/transactions`)
- ⬜ Page Retraits (`/withdrawals`)
- ⬜ Page Commissions (`/commissions`)
- ⬜ Page Paramètres (`/settings`)
- ⬜ Page Logs (`/logs`)
- ⬜ Modals transversaux (ConfirmAction, KYCReview, Refund, SendEmail...)

---

## PHASE 5 — Intégration & Tests end-to-end

- ⬜ Test flow complet : inscription créateur → KYC → publication média
- ⬜ Test flow complet : inscription client → abonnement → achat média
- ⬜ Test flow complet : messages temps réel créateur ↔ client
- ⬜ Test flow complet : demande retrait → validation admin → créateur notifié
- ⬜ Test flow complet : signalement → modération admin → contenu retiré
- ⬜ Test déconnexion forcée via Redis (suspension compte)
- ⬜ Test cookies httpOnly (vérifier que le token n'est pas visible dans DevTools)

---

## PHASE 6 — Stripe (paiements réels)

- ⬜ Créer un compte Stripe
- ⬜ Configurer Stripe Checkout pour l'achat de crédits
- ⬜ Webhook Stripe → crédit automatique après paiement
- ⬜ Tester en mode test Stripe
- ⬜ Passer en mode live

---

## PHASE 7 — Conteneurisation complète

> Tout ce qui précède tourne en local sans Docker (sauf Redis).
> Cette phase prépare la mise en production.

- ⬜ `Dockerfile` pour `basic-instinct-api`
- ⬜ `Dockerfile` pour `basic-instinct` (BFF + build React)
- ⬜ `Dockerfile` pour `basic-instinct-studio` (BFF + build React)
- ⬜ `Dockerfile` pour `basic-instinct-admin` (BFF + build React)
- ⬜ `docker-compose.yml` global qui lance tout
- ⬜ Variables d'environnement de production
- ⬜ Tester que tout fonctionne dans Docker
- ⬜ Vérifier que le port 4000 (API) n'est pas exposé à l'extérieur
- ⬜ Vérifier que Redis n'est pas exposé à l'extérieur

---

## PHASE 8 — Migration SQLite → PostgreSQL (prod)

- ⬜ Provisionner un serveur PostgreSQL
- ⬜ Changer `provider = "sqlite"` → `provider = "postgresql"` dans `schema.prisma`
- ⬜ Lancer `prisma migrate deploy`
- ⬜ Vérifier que toutes les données sont bien migrées
- ⬜ Tester l'application complète sur PostgreSQL

---

## Récap visuel

```
Phase 0   Redis Docker                    ← 15 minutes
Phase 1   basic-instinct-api             ← le plus long, cœur du projet
Phase 2   BFF client public              ← rapide (~100 lignes)
Phase 3   BFF studio créateur            ← rapide (copier Phase 2)
Phase 4   Admin frontend + BFF           ← frontend complet à coder
Phase 5   Tests end-to-end               ← validation globale
Phase 6   Stripe                         ← paiements réels
Phase 7   Docker complet                 ← mise en prod
Phase 8   PostgreSQL                     ← prod finale
```

---

## Documents de référence

| Document                 | Contenu                                |
| ------------------------ | -------------------------------------- |
| `api_analyse.md`         | Schéma BDD, endpoints, stack technique |
| `admin_analyse.md`       | Pages admin, userflows, composants     |
| `bff_architecture.md`    | Explication BFF proxy, code, sécurité  |
| `studio_v2_interface.md` | Pages studio, composants existants     |
