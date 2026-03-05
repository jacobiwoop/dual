/**
 * Script : Upload avatars pour les 10 créatrices seeds vers Cloudflare R2
 * Stocke uniquement la CLÉ R2 dans avatarUrl (le backend signe les URLs à la demande).
 *
 * Usage : npx dotenvx run -- npx tsx src/scripts/upload-creator-avatars.ts
 */

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME } from '../lib/r2';
import { prisma } from '../lib/prisma';

const CREATORS = [
  { username: 'sofiamonroe',  url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80' },
  { username: 'lunarossi',    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80' },
  { username: 'chloemartin',  url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80' },
  { username: 'zaraknight',   url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80' },
  { username: 'ninabelle',    url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80' },
  { username: 'evasantos',    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80' },
  { username: 'miadupont',    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80' },
  { username: 'ariavoss',     url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' },
  { username: 'jadeleblanc',  url: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=600&q=80' },
  // rosetaylor: image alternative (la précédente retournait 404)
  { username: 'rosetaylor',   url: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=600&q=80' },
];

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${url} → HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  console.log('🚀 Upload avatars → Cloudflare R2 (stockage clé uniquement)\n');

  for (const creator of CREATORS) {
    try {
      const user = await prisma.user.findUnique({ where: { username: creator.username } });
      if (!user) {
        console.log(`⚠️  Introuvable : @${creator.username}`);
        continue;
      }

      console.log(`📥 Download : @${creator.username}`);
      const buffer = await downloadImage(creator.url);

      const r2Key = `avatars/creators/${creator.username}.jpg`;
      console.log(`☁️  Upload R2 : ${r2Key}`);
      await r2Client.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: r2Key,
        Body: buffer,
        ContentType: 'image/jpeg',
      }));

      // Stocker UNIQUEMENT la clé R2 — le backend signera l'URL à la demande
      await prisma.user.update({
        where: { username: creator.username },
        data: { avatarUrl: r2Key },
      });

      console.log(`✅ @${creator.username} → clé: ${r2Key}\n`);
    } catch (err: any) {
      console.error(`❌ @${creator.username} :`, err.message, '\n');
    }
  }

  console.log('🎉 Terminé !');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
