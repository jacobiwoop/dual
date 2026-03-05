import { prisma } from './src/lib/prisma';
import { queueMediaProcessing } from './src/lib/queue';

async function main() {
  const items = await prisma.mediaItem.findMany({
    where: { thumbnailUrl: null, type: 'image' },
  });

  console.log(`Found ${items.length} media items without thumbnails.`);

  for (const item of items) {
    if (item.url) {
      // The url contains the R2 key, e.g. https://pub-xxxxx.r2.dev/uploads/...
      // Extract the key part after the origin.
      const urlObj = new URL(item.url);
      const key = urlObj.pathname.replace(/^\//, ''); // removes leading slash
      
      console.log(`Queueing ${item.id} with key ${key}`);
      await queueMediaProcessing(item.id, key, item.type as any, 'generate-thumbnail', 'MediaItem');
    }
  }

  console.log('Finished queueing.');
  process.exit(0);
}

main().catch(console.error);
