# Plan d'Implémentation Backend - Creator Studio

Ce document répertorie l'ensemble des routes API (par exemple REST, mais adaptable GraphQL) et de la logique métier que nous devons construire côté serveur pour faire fonctionner l'interface utilisateur que nous venons de créer.

---

## 1. Utilisateurs & Authentification (Auth & Users)

**Modèles clés :** `User` (email, mot de passe hashé, rôle, avatar, bio, prix abonnement)

- **POST** `/api/auth/register` : Créer un compte créateur / client
- **POST** `/api/auth/login` : Connexion (JWT ou Session) et retour du token
- **POST** `/api/auth/logout` : Déconnexion et révocation du token
- **GET** `/api/users/me` : Récupérer le profil complet de l'utilisateur connecté (créateur ou client)
- **PUT** `/api/users/me` : Mettre à jour le profil (bio, nom d'affichage, tags, prix d'abonnement, etc.)
- **POST** `/api/users/me/avatar` : Upload d'une nouvelle photo de profil / bannière (vers S3 ou stockage local)

## 2. Abonnements & Finance (Subscriptions & Billing)

**Modèles clés :** `Subscription`, `Transaction`, `WithdrawalRequest`

- **GET** `/api/finance/balance` : Obtenir le solde actuel du créateur, le total généré et le "Revenu du mois" dynamique
- **GET** `/api/finance/transactions` : Obtenir l'historique des paiements (abonnements, pourboires, médias payants débloqués, demandes)
- **POST** `/api/finance/withdraw` : Créer une demande de retrait des fonds
- **POST** `/api/creators/:id/subscribe` : (Client) S'abonner à un créateur (Stripe Checkout)

## 3. Médias Publics (Feed & Public Galleries)

**Modèles clés :** `MediaItem` (url, type, price, visibility), `Gallery` (titre, prix, description)

- **GET** `/api/media` : Lister les médias publics du créateur (avec filtres de visibilité: free, paid, subscribers)
- **POST** `/api/media` : Uploader un nouveau média (photo/vidéo) public + encodage vidéo éventuel
- **PUT** `/api/media/:id` : Modifier un média public (changer le prix, la visibilité)
- **DELETE** `/api/media/:id` : Supprimer un média public
- **GET** `/api/galleries` : Lister les galeries publiques
- **POST** `/api/galleries` : Créer une nouvelle galerie (ex: Bundle de photos)
- **POST** `/api/galleries/:id/media` : Ajouter des médias à une galerie spécifique

## 4. Bibliothèque Privée (Private Library for Messages)

**Modèles clés :** `LibraryItem` (url, type, folderId), `LibraryFolder` (titre, couverture)
_(Cette section est 100% découplée de la vue publique, utilisée uniquement pour organiser les envois privés)._

- **GET** `/api/library/folders` : Lister tous les dossiers privés du créateur
- **POST** `/api/library/folders` : Créer un nouveau dossier (ex: "Pack Vidéos Privées")
- **DELETE** `/api/library/folders/:id` : Supprimer un dossier privé
- **GET** `/api/library/items` : Lister les fichiers locaux/privés d'un créateur
- **POST** `/api/library/items` : Uploader de nouveaux médias privés (Dropzone)
- **DELETE** `/api/library/items/:id` : Supprimer un ou plusieurs médias privés

## 5. Messagerie (Chat & Conversations)

**Modèles clés :** `Conversation` (participants, lastMessage), `Message` (text, mediaId, isPaid, price, unlockedBy)

- **GET** `/api/conversations` : Lister les conversations actives triées par récence, incluant le `unreadCount`
- **GET** `/api/conversations/:id/messages` : Récupérer l'historique de la conversation (avec pagination/infinite scroll)
- **POST** `/api/conversations/:id/messages` : Envoyer un message (texte)
- **POST** `/api/conversations/:id/messages/media` : Envoyer un média (depuis la bibliothèque privée).
  - _Logique :_ Si `isPaid=true`, associer le `price`. Le média sera flouté côté client tant qu'il n'est pas payé.
- **POST** `/api/messages/:messageId/unlock` : (Client) Payer pour débloquer un message payant. Déclenche une transaction.
- **PUT** `/api/conversations/:id/read` : Marquer tous les messages d'une conversation comme lus (remise du badge à 0)

## 6. Demandes Personnalisées (Custom Requests)

**Modèles clés :** `Request` (clientId, type, description, price, status, deliveryMediaId)

- **GET** `/api/requests` : Lister les demandes assignées au créateur (pending, accepted, completed)
- **PUT** `/api/requests/:id/status` : Changer le statut ("accepted" ou "rejected")
- **POST** `/api/requests/:id/deliver` : Envoyer le média de complétion pour fermer la demande et débloquer les fonds

## 7. Gestion CRM Clients (Client Notes)

**Modèles clés :** `ClientNote` (creatorId, clientId, notesText)

- **GET** `/api/clients/:clientId/notes` : Récupérer les notes privées que le créateur a prises sur un client spécifique
- **PUT** `/api/clients/:clientId/notes` : Mettre à jour le texte des notes (`StickyNote`)

## 8. Temps Réel & Notifications (WebSockets / Push)

**Connexion :** `wss://api.example.com/socket`

- **Événement `new_message`** : Pousser le message au client en direct pour mettre à jour la vue Messages instantanément
- **Événement `message_read`** : Confirmer la lecture pour cacher le point non lu
- **Événement `payment_received`** : Notification en direct ("Le client A a débloqué votre média pour 200🪙")
- **Événement `new_request`** : Nouvelle demande personnalisée
- **GET** `/api/notifications` : API de secours pour récupérer l'historique des notifications (`unreadNotifications`)

## 9. Paramètres (Settings & Automations)

- **GET** `/api/settings` : Récupérer les paramètres globaux du créateur
- **PUT** `/api/settings` : Mettre à jour les préférences de notification, le message de bienvenue automatique envoyé aux nouveaux abonnés, etc.

---

### Résumé des priorités Backend (Phase 1)

Pour commencer à rendre l'application fonctionnelle, les 4 briques fondamentales à implémenter sont :

1. **L'Auth (Créer un compte et se connecter)**
2. **Le système d'Upload S3 / Local (Pour les avatars, la bibliothèque privée et les médias publics)**
3. **La Messagerie (CRUD Conversations, envoi de texte, websockets)**
4. **La Messagerie Payante (Déverrouillage des médias et gestion du solde "🪙")**
