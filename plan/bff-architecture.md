# 🔐 Architecture BFF — Backend For Frontend

> Explication de l'architecture proxy sécurisé utilisée dans Basic Instinct

---

## 1. Le problème sans BFF

Sans BFF, le navigateur appelle directement l'API :

```
Navigateur
    │
    ├── GET https://api.basic-instinct.com/creator/media
    │   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...   ← token visible dans le navigateur
    │
    └── L'URL de l'API est exposée, le token est lisible dans les DevTools
```

N'importe qui peut ouvrir les DevTools du navigateur et voir :

- L'URL complète de `basic-instinct-api`
- Le token JWT dans les headers
- La structure de l'API (endpoints, paramètres)

---

## 2. La solution — BFF Proxy

Chaque app a son propre petit serveur Express qui sert d'intermédiaire :

```
Navigateur
    │
    │  cookie httpOnly (invisible au JS)
    ▼
BFF (Express)          ← seul le navigateur le connaît
    │
    │  Authorization: Bearer token   ← le token ne quitte jamais le serveur
    ▼
basic-instinct-api     ← invisible depuis le navigateur
    │
    ▼
Base de données
```

Le navigateur ne connaît que le BFF. Il ne sait pas que `basic-instinct-api` existe.

---

## 3. Architecture complète

```
┌─────────────────────────────────────────────────────────────────┐
│  NAVIGATEUR                                                     │
│                                                                 │
│  basic-instinct      → localhost:3000  (client public)         │
│  basic-instinct-studio → localhost:3001  (studio créateur)     │
│  basic-instinct-admin  → localhost:3002  (admin)               │
└──────────┬──────────────────────┬──────────────────────────────┘
           │ cookie httpOnly       │ cookie httpOnly
           ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│   BFF Client     │   │   BFF Studio     │   │   BFF Admin      │
│   :3000/server   │   │   :3001/server   │   │   :3002/server   │
│   ~100 lignes    │   │   ~100 lignes    │   │   ~100 lignes    │
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │  JWT dans les headers (réseau interne Docker)
                                ▼
                   ┌────────────────────────┐
                   │   basic-instinct-api   │
                   │       :4000            │
                   │  Auth + Sessions + BDD │
                   └────────────┬───────────┘
                                │
                   ┌────────────┴───────────┐
                   ▼                        ▼
             ┌──────────┐           ┌──────────────┐
             │  SQLite  │           │    Redis     │
             │  (→ PG)  │           │   sessions   │
             └──────────┘           └──────────────┘
```

---

## 4. Structure de chaque projet

```
basic-instinct/
├── client/                  → React + TypeScript (Vite)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── ...
│   ├── index.html
│   └── vite.config.ts
│
├── server/                  → Node.js + Express + TypeScript
│   ├── src/
│   │   ├── index.ts         → point d'entrée Express
│   │   ├── proxy.ts         → forward vers l'API
│   │   └── middleware/
│   │       ├── auth.ts      → vérifie le cookie de session
│   │       └── rateLimit.ts → optionnel
│   └── tsconfig.json
│
├── package.json             → scripts pour lancer client + server
└── docker-compose.yml       → optionnel, pour dev local
```

---

## 5. Ce que fait le BFF — concrètement

Le serveur BFF est minimaliste. Il fait exactement 3 choses :

### 5.1 Servir le frontend React (en prod)

```typescript
// server/src/index.ts
import express from "express";
import path from "path";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

// 1. Servir les fichiers statiques du build React
app.use(express.static(path.join(__dirname, "../../client/dist")));
```

### 5.2 Proxy toutes les requêtes /api vers l'API cachée

```typescript
// 2. Toutes les requêtes /api sont forwardées à l'API
//    Le navigateur ne voit jamais l'URL de l'API
app.use(
  "/api",
  createProxyMiddleware({
    target: process.env.API_URL, // http://basic-instinct-api:4000
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq, req) => {
        // Récupère le token depuis le cookie httpOnly
        // et l'ajoute en header pour l'API
        const token = req.cookies?.session_token;
        if (token) {
          proxyReq.setHeader("Authorization", `Bearer ${token}`);
        }
      },
    },
  }),
);
```

### 5.3 Stocker le token dans un cookie httpOnly après login

```typescript
// 3. Après login, on reçoit le token de l'API
//    et on le stocke dans un cookie httpOnly
//    → le JS du navigateur ne peut JAMAIS y accéder
app.post("/auth/login", async (req, res) => {
  const response = await fetch(`${process.env.API_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify(req.body),
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();

  if (data.access_token) {
    res.cookie("session_token", data.access_token, {
      httpOnly: true, // inaccessible au JavaScript
      secure: true, // HTTPS uniquement en prod
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
    });
    res.json({ success: true });
  }
});

// Toutes les autres routes → React (SPA routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

app.listen(3000);
```

---

## 6. Ce que voit le navigateur vs la réalité

| Ce que voit le navigateur | La réalité côté serveur                                    |
| ------------------------- | ---------------------------------------------------------- |
| `POST /auth/login`        | BFF → `POST http://api:4000/auth/login`                    |
| `GET /api/creator/media`  | BFF → `GET http://api:4000/creator/media` + header JWT     |
| Cookie `session_token`    | Stocké en httpOnly, illisible par le JS                    |
| Aucune URL d'API          | L'URL `basic-instinct-api` n'existe pas pour le navigateur |

---

## 7. Flux de connexion complet

```
1. Utilisateur soumet le formulaire de login
   → POST /auth/login  { email, password }
   → Naviguateur envoie au BFF (pas à l'API directement)

2. BFF transmet à l'API
   → POST http://basic-instinct-api:4000/auth/login

3. L'API vérifie les credentials, génère un JWT
   → retourne { access_token: "eyJ..." }

4. Le BFF intercepte la réponse
   → Stocke le token dans un cookie httpOnly
   → Retourne { success: true } au navigateur (sans le token)

5. Le navigateur reçoit uniquement { success: true }
   → Il ne voit jamais le token
   → Le cookie est posé automatiquement par le navigateur

6. Pour chaque requête suivante
   → Le navigateur envoie le cookie automatiquement
   → Le BFF lit le token depuis le cookie
   → L'ajoute en header Authorization avant de forwarder à l'API
```

---

## 8. Flux de requête normale (après login)

```
1. React appelle fetch('/api/creator/media')
   → Le cookie session_token est envoyé automatiquement

2. BFF reçoit la requête
   → Lit session_token depuis le cookie
   → Forward vers http://basic-instinct-api:4000/creator/media
   → Ajoute Authorization: Bearer {token}

3. L'API traite la requête normalement
   → Retourne les données

4. Le BFF retourne la réponse au navigateur
   → Les données arrivent dans React
```

---

## 9. Différences entre les 3 BFF

Les 3 BFF sont quasi identiques — seuls quelques détails changent :

|                          | BFF Client `:3000`          | BFF Studio `:3001`  | BFF Admin `:3002`         |
| ------------------------ | --------------------------- | ------------------- | ------------------------- |
| Port                     | 3000                        | 3001                | 3002                      |
| Cookie name              | `bi_client_session`         | `bi_studio_session` | `bi_admin_session`        |
| Middleware auth          | optionnel (pages publiques) | requis partout      | requis + vérif rôle admin |
| Rate limiting            | modéré                      | modéré              | strict                    |
| Redirect si non connecté | `/login`                    | `/login`            | `/login`                  |

Le BFF Admin ajoute une vérification supplémentaire : si le token ne correspond pas à un compte `admin`, la requête est bloquée au niveau du BFF avant même d'atteindre l'API.

---

## 10. En développement

En dev, Vite tourne séparément et le BFF proxy les requêtes `/api` vers l'API. Pas besoin de build React pour tester.

```
# Terminal 1 — API centrale
cd basic-instinct-api && docker compose up

# Terminal 2 — BFF + React client
cd basic-instinct && npm run dev
  → Vite démarre sur :3000 (React)
  → Express BFF démarre sur :3001 (proxy)
  → Vite proxifie /api vers le BFF qui proxifie vers l'API
```

---

## 11. En production

```
docker compose up

basic-instinct-client  :3000  → Express sert le build React + proxy API
basic-instinct-studio  :3001  → Express sert le build React + proxy API
basic-instinct-admin   :3002  → Express sert le build React + proxy API
basic-instinct-api     :4000  → API (non exposée publiquement)
redis                  :6379  → interne uniquement
```

L'API tourne sur le port 4000 mais **n'est pas exposée à internet**. Seuls les 3 BFF peuvent lui parler, via le réseau interne Docker. Depuis l'extérieur, le port 4000 est fermé.

```
Internet → :3000 ✅  (client public)
Internet → :3001 ✅  (studio)
Internet → :3002 ✅  (admin)
Internet → :4000 ❌  (bloqué — API invisible)
Internet → :6379 ❌  (bloqué — Redis invisible)
```
