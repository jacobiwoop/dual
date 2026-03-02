# 🚀 PHASE 2 — Upload & Stockage Médias

**Durée estimée** : 2-3 semaines  
**Priorité** : HAUTE  
**Dépendances** : Phase 1 (✅ Complétée)

---

## 📊 Vue d'ensemble

La Phase 2 vise à implémenter un système complet d'upload et de stockage de médias (images et vidéos) avec processing automatique, génération de thumbnails, et sécurisation des accès.

---

## 🎯 Objectifs

1. Permettre aux créateurs d'uploader des images et vidéos
2. Stocker les médias de manière scalable et sécurisée
3. Générer automatiquement des thumbnails
4. Processer les vidéos (compression, formats multiples)
5. Sécuriser l'accès aux médias privés
6. Implémenter le watermarking pour médias payants

---

## 🏗️ Architecture technique

### Stack recommandée

**Option A : AWS** (Recommandé)

- **S3** : Stockage médias
- **CloudFront** : CDN pour delivery rapide
- **Lambda** : Processing images/vidéos
- **MediaConvert** : Transcoding vidéos

**Option B : Cloudflare R2** (Alternative économique)

- **R2** : Stockage S3-compatible (pas de frais egress)
- **Cloudflare Images** : Processing automatique
- **Stream** : Vidéos adaptatives

**Option C : Self-hosted** (Pour contrôle total)

- **MinIO** : S3-compatible self-hosted
- **Sharp** : Processing images Node.js
- **FFmpeg** : Processing vidéos

### Décision recommandée

**Cloudflare R2 + Images + Stream** pour :

- Coûts réduits (pas de frais sortie)
- Performance CDN global
- Processing intégré
- Simplicité d'intégration

---

## 📋 Plan d'action détaillé

### Semaine 1 : Setup Infrastructure & Upload Basique

#### Task 1.1 : Configuration Cloudflare R2 (1 jour)

**Objectif** : Setup bucket R2 et credentials

**Actions** :

- [ ] Créer compte Cloudflare (si nécessaire)
- [ ] Activer R2 Storage
- [ ] Créer bucket `basic-instinct-media`
- [ ] Générer API tokens (R2 + Images)
- [ ] Configurer CORS pour uploads directs
- [ ] Tester connexion depuis Node.js

**Fichiers à créer** :

- `.env` : Ajouter variables R2
- `src/lib/r2.ts` : Client R2 (AWS SDK)

**Variables d'environnement** :

```env
# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=basic-instinct-media
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Cloudflare Images
CF_IMAGES_ACCOUNT_ID=your_account_id
CF_IMAGES_API_TOKEN=your_api_token
CF_IMAGES_ACCOUNT_HASH=your_hash
```

**Code à implémenter** :

```typescript
// src/lib/r2.ts
import { S3Client } from "@aws-sdk/client-s3";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```

---

#### Task 1.2 : Presigned URLs pour upload direct (1-2 jours)

**Objectif** : Upload direct depuis frontend vers R2

**Flow** :

1. Frontend demande presigned URL au backend
2. Backend génère URL signée (expire 1h)
3. Frontend upload directement vers R2
4. Frontend notifie backend (URL + métadonnées)
5. Backend crée entrée DB

**Endpoints à créer** :

```
POST /api/creator/media/upload-url      # Générer presigned URL
POST /api/creator/media/confirm         # Confirmer upload
```

**Schéma Zod** :

```typescript
// src/schemas/media.schemas.ts
export const requestUploadUrlSchema = z.object({
  body: z.object({
    filename: z.string(),
    contentType: z.string(),
    type: z.enum(["image", "video"]),
    size: z.number().max(500 * 1024 * 1024), // 500MB max
  }),
});

export const confirmUploadSchema = z.object({
  body: z.object({
    key: z.string(),
    url: z.string().url(),
    filename: z.string(),
    contentType: z.string(),
    size: z.number(),
    type: z.enum(["image", "video"]),
    folderId: z.string().uuid().optional(),
  }),
});
```

**Contrôleur** :

```typescript
// src/controllers/creator/media.controller.ts
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "../../lib/r2";

export const mediaController = {
  async requestUploadUrl(req: Request, res: Response) {
    const { filename, contentType, type } = req.body;
    const creatorId = req.user!.userId;

    // Générer key unique
    const key = `uploads/${creatorId}/${Date.now()}-${filename}`;

    // Générer presigned URL
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600, // 1 heure
    });

    res.json({
      uploadUrl,
      key,
      expiresIn: 3600,
    });
  },

  async confirmUpload(req: Request, res: Response) {
    const { key, url, filename, contentType, size, type, folderId } = req.body;
    const creatorId = req.user!.userId;

    // Créer LibraryItem
    const item = await prisma.libraryItem.create({
      data: {
        creatorId,
        folderId: folderId || null,
        url,
        type,
        filename,
        sizeBytes: BigInt(size),
        // thumbnailUrl sera ajouté après processing
      },
    });

    // Déclencher processing asynchrone
    await queueMediaProcessing(item.id, key, type);

    res.status(201).json({ item });
  },
};
```

---

#### Task 1.3 : Validation fichiers (0.5 jour)

**Objectif** : Valider taille, type, dimensions

**Validations** :

- **Images** : JPEG, PNG, WebP, GIF max 50MB
- **Vidéos** : MP4, WebM, MOV max 500MB
- **Dimensions** : Max 8000x8000 pixels
- **Durée vidéo** : Max 30 minutes

**Middleware** :

```typescript
// src/middleware/fileValidation.ts
export const validateFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { contentType, size, type } = req.body;

  // Types autorisés
  const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const allowedVideos = ["video/mp4", "video/webm", "video/quicktime"];

  if (type === "image" && !allowedImages.includes(contentType)) {
    return res.status(400).json({ error: "Type d'image non supporté" });
  }

  if (type === "video" && !allowedVideos.includes(contentType)) {
    return res.status(400).json({ error: "Type de vidéo non supporté" });
  }

  // Taille max
  const maxSize = type === "image" ? 50 * 1024 * 1024 : 500 * 1024 * 1024;
  if (size > maxSize) {
    return res.status(400).json({
      error: `Fichier trop volumineux (max ${maxSize / 1024 / 1024}MB)`,
    });
  }

  next();
};
```

---

### Semaine 2 : Processing Images & Vidéos

#### Task 2.1 : Cloudflare Images pour processing automatique (1 jour)

**Objectif** : Thumbnails et variants d'images automatiques

**Setup** :

- Activer Cloudflare Images
- Définir variants (thumbnail, medium, large)
- Intégrer API

**Variants** :

```typescript
// Cloudflare Images Variants
{
  "thumbnail": "width=200,height=200,fit=cover",
  "medium": "width=800,height=800,fit=scale-down",
  "large": "width=1920,height=1920,fit=scale-down",
  "blur": "width=50,height=50,blur=20" // Pour previews
}
```

**Upload vers Cloudflare Images** :

```typescript
async function uploadToCloudflareImages(file: Buffer, id: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("id", id);

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_IMAGES_ACCOUNT_ID}/images/v1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_IMAGES_API_TOKEN}`,
      },
      body: formData,
    },
  );

  const data = await response.json();
  return data.result.variants;
}
```

---

#### Task 2.2 : Queue de processing avec BullMQ (1-2 jours)

**Objectif** : Processing asynchrone des médias

**Stack** :

- **BullMQ** : Queue jobs
- **Redis** : Backend queue
- **Worker** : Processing séparé

**Installation** :

```bash
npm install bullmq ioredis
```

**Setup Queue** :

```typescript
// src/lib/queue.ts
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";

const connection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});

export const mediaQueue = new Queue("media-processing", { connection });

// Worker
export const mediaWorker = new Worker(
  "media-processing",
  async (job) => {
    const { itemId, key, type } = job.data;

    if (type === "image") {
      await processImage(itemId, key);
    } else if (type === "video") {
      await processVideo(itemId, key);
    }
  },
  { connection },
);
```

**Processing Images** :

```typescript
async function processImage(itemId: string, key: string) {
  // 1. Télécharger depuis R2
  const file = await downloadFromR2(key);

  // 2. Upload vers Cloudflare Images
  const variants = await uploadToCloudflareImages(file, itemId);

  // 3. Mettre à jour DB
  await prisma.libraryItem.update({
    where: { id: itemId },
    data: {
      thumbnailUrl: variants.thumbnail,
      url: variants.large,
    },
  });
}
```

---

000000-0000000900000000000000**Objectif** : Streaming vidéo adaptatif

**Cloudflare Stream** :

- Transcoding automatique (HLS, DASH)
- Qualités multiples (360p, 720p, 1080p)
- Thumbnails automatiques
- Player intégré

**Upload vers Stream** :

```typescript
async function uploadToCloudflareStream(url: string) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${R2_ACCOUNT_ID}/stream/copy`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_STREAM_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url, // R2 URL
        meta: { name: "Video upload" },
      }),
    },
  );

  const data = await response.json();
  return data.result;
}
```

**Player URL** :

```
https://customer-${ACCOUNT_HASH}.cloudflarestream.com/${VIDEO_ID}/iframe
```

---

### Semaine 3 : Sécurité & Optimisations

#### Task 3.1 : Signed URLs pour médias privés (1 jour)

**Objectif** : Accès sécurisé aux médias privés/payants

**Génération signed URL** :

```typescript
// src/lib/signedUrls.ts
import crypto from "crypto";

export function generateSignedUrl(
  path: string,
  expiresIn: number = 3600,
): string {
  const secret = process.env.MEDIA_SECRET!;
  const expires = Math.floor(Date.now() / 1000) + expiresIn;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${path}:${expires}`)
    .digest("hex");

  return `${path}?expires=${expires}&signature=${signature}`;
}

export function verifySignedUrl(
  path: string,
  expires: number,
  signature: string,
): boolean {
  const secret = process.env.MEDIA_SECRET!;

  // Vérifier expiration
  if (Math.floor(Date.now() / 1000) > expires) {
    return false;
  }

  // Vérifier signature
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${path}:${expires}`)
    .digest("hex");

  return signature === expected;
}
```

**Endpoint pour récupérer signed URL** :

```typescript
// GET /api/creator/media/:id/url
async getMediaUrl(req: Request, res: Response) {
  const { id } = req.params;
  const userId = req.user!.userId;

  const item = await prisma.libraryItem.findUnique({
    where: { id },
  });

  if (!item) {
    return res.status(404).json({ error: 'Média non trouvé' });
  }

  // Vérifier permissions
  if (item.creatorId !== userId) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  const signedUrl = generateSignedUrl(item.url, 3600);

  res.json({ url: signedUrl, expiresIn: 3600 });
}
```

---

#### Task 3.2 : Watermarking pour médias payants (1-2 jours)

**Objectif** : Ajouter watermark sur médias payants non débloqués

**Watermark avec Sharp** :

```bash
npm install sharp
```

```typescript
// src/lib/watermark.ts
import sharp from "sharp";

export async function addWatermark(
  imageBuffer: Buffer,
  text: string,
): Promise<Buffer> {
  const watermarkSvg = `
    <svg width="800" height="600">
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        font-size="48"
        font-family="Arial"
        fill="rgba(255,255,255,0.5)"
        transform="rotate(-45 400 300)"
      >
        ${text}
      </text>
    </svg>
  `;

  return sharp(imageBuffer)
    .composite([
      {
        input: Buffer.from(watermarkSvg),
        gravity: "center",
      },
    ])
    .toBuffer();
}
```

**Blur pour previews** :

```typescript
export async function blurImage(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer).blur(20).toBuffer();
}
```

---

#### Task 3.3 : Cleanup & Optimisations (1 jour)

**Objectif** : Nettoyage médias orphelins, optimisations

**Cron job cleanup** :

```typescript
// src/jobs/mediaCleanup.ts
import cron from "node-cron";

// Tous les jours à 3h du matin
cron.schedule("0 3 * * *", async () => {
  // Supprimer médias orphelins (non référencés)
  const orphans = await prisma.libraryItem.findMany({
    where: {
      messageLinks: { none: {} },
      createdAt: {
        lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 jours
      },
    },
  });

  for (const item of orphans) {
    await deleteFromR2(item.url);
    await prisma.libraryItem.delete({ where: { id: item.id } });
  }

  logger.info(`Cleaned up ${orphans.length} orphan media items`);
});
```

**Optimisations** :

- CDN caching headers
- Lazy loading
- Progressive images
- Compression automatique

---

## 📊 Schéma de flux

### Upload Flow

```
Frontend                Backend              R2/Cloudflare
   |                       |                      |
   |-- Request URL ------->|                      |
   |                       |-- Generate --------->|
   |                       |                      |
   |<--- Presigned URL ----|<----- URL -----------|
   |                       |                      |
   |-- Upload File -------------------------------->|
   |                       |                      |
   |<----- Success ------------------------------- |
   |                       |                      |
   |-- Confirm Upload ---->|                      |
   |                       |-- Queue Processing ->|
   |                       |                      |
   |<--- Item Created -----|                      |
```

### Processing Flow

```
Queue Worker         Cloudflare          Database
     |                   |                  |
     |-- Download -------|                  |
     |                   |                  |
     |-- Upload -------->|                  |
     |                   |                  |
     |<--- Variants -----|                  |
     |                                      |
     |-- Update Item -----------------------|
```

---

## 🔧 Configuration finale

### Variables d'environnement complètes

```env
# Cloudflare R2
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=basic-instinct-media
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Cloudflare Images
CF_IMAGES_ACCOUNT_ID=xxx
CF_IMAGES_API_TOKEN=xxx
CF_IMAGES_ACCOUNT_HASH=xxx

# Cloudflare Stream
CF_STREAM_API_TOKEN=xxx

# Redis (pour BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379

# Media Processing
MEDIA_SECRET=your-secret-for-signed-urls
MAX_IMAGE_SIZE=52428800      # 50MB
MAX_VIDEO_SIZE=524288000     # 500MB
MAX_VIDEO_DURATION=1800      # 30min
```

---

## 📋 Checklist Phase 2

### Infrastructure

- [ ] Cloudflare R2 configuré
- [ ] Cloudflare Images activé
- [ ] Cloudflare Stream activé
- [ ] Redis installé (BullMQ)
- [ ] Variables env configurées

### Upload

- [ ] Presigned URLs fonctionnels
- [ ] Validation fichiers
- [ ] Upload direct frontend → R2
- [ ] Confirmation upload backend

### Processing

- [ ] Queue BullMQ configurée
- [ ] Worker processing images
- [ ] Worker processing vidéos
- [ ] Thumbnails automatiques
- [ ] Variants multiples

### Sécurité

- [ ] Signed URLs pour accès privé
- [ ] Watermarking médias payants
- [ ] Validation permissions
- [ ] Rate limiting upload

### Optimisations

- [ ] CDN caching
- [ ] Compression automatique
- [ ] Cleanup médias orphelins
- [ ] Monitoring erreurs

---

## 🧪 Tests à effectuer

### Upload

```bash
# Test presigned URL
POST /api/creator/media/upload-url
→ Vérifie génération URL

# Test upload direct
PUT <presigned-url>
→ Upload fichier test

# Test confirm
POST /api/creator/media/confirm
→ Vérifie création item DB
```

### Processing

```bash
# Vérifier queue
→ Job créé dans Redis

# Vérifier worker
→ Processing effectué

# Vérifier variants
→ Thumbnails générés
```

### Sécurité

```bash
# Test signed URL
GET /api/creator/media/:id/url
→ URL signée valide

# Test accès non autorisé
GET <media-url>
→ 403 si pas de signature
```

---

## 📈 Métriques de succès

- [ ] Upload images < 5s
- [ ] Upload vidéos < 30s
- [ ] Processing images < 10s
- [ ] Processing vidéos < 2min
- [ ] 99.9% uptime R2
- [ ] 0 médias perdus
- [ ] CDN hit rate > 90%

---

## 💰 Estimation coûts

### Cloudflare R2

- Storage : $0.015/GB/mois
- Opérations : Quasi gratuit
- **Pas de frais egress** 🎉

### Cloudflare Images

- $5/mois pour 100K images
- $0.50/10K variants

### Cloudflare Stream

- $1/1000 min stockées
- $1/1000 min délivrées

### Redis Cloud (pour BullMQ)

- Free tier : 30MB (dev)
- Production : $10-20/mois

**Total estimé** : ~$20-50/mois (démarrage)

---

## 🔜 Phase 3 Preview

Après Phase 2, la Phase 3 implémentera :

- Paiements Stripe
- Achat de crédits
- Abonnements récurrents
- Webhooks Stripe
- Gestion commissions

---

**Durée estimée Phase 2** : 2-3 semaines  
**Complexité** : Moyenne-Haute  
**Priorité** : Haute

Prêt pour commencer Phase 2 ? 🚀
