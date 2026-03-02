import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import logger from '../lib/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testLocalUpload() {
  try {
    logger.info('🧪 Testing Local Image Processing (Simulation R2)...');

    // 1. Trouver une image à la racine (ou créer un dossier out)
    const projectRoot = path.join(__dirname, '..', '..', '..');
    const imageFiles = ['image.jpg', 'image.jpeg', 'image.png'].map(f => path.join(projectRoot, f));
    
    let testImagePath: string | null = null;
    for (const imgPath of imageFiles) {
      if (fs.existsSync(imgPath)) {
        testImagePath = imgPath;
        break;
      }
    }

    if (!testImagePath) {
      logger.error('❌ Aucune image trouvée à la racine (image.jpg, etc.)');
      process.exit(1);
    }

    logger.info(`✅ Image trouvée: ${testImagePath}`);
    const imageBuffer = fs.readFileSync(testImagePath);

    // 2. Créer le dossier de sortie
    const outDir = path.join(__dirname, '..', '..', 'test-output');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }

    // 3. Simuler generateThumbnail
    logger.info('📸 Génération de la miniature (thumbnail)...');
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(400, 400, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    fs.writeFileSync(path.join(outDir, 'thumb.jpg'), thumbnailBuffer);
    logger.info(`✅ Thumbnail sauvegardée dans: ${outDir}/thumb.jpg`);

    // 4. Simuler generateImageVariants
    logger.info('📐 Génération des variantes (small, medium, large)...');
    const variants = [
      { name: 'small', width: 640, quality: 80 },
      { name: 'medium', width: 1280, quality: 85 },
      { name: 'large', width: 1920, quality: 90 },
    ];

    const metadata = await sharp(imageBuffer).metadata();
    
    for (const variant of variants) {
      if (metadata.width && metadata.width < variant.width) {
        logger.info(`⏩ Passage de la variante ${variant.name} (image d'origine trop petite)`);
        continue;
      }
      
      const variantBuffer = await sharp(imageBuffer)
        .resize(variant.width, null, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: variant.quality })
        .toBuffer();
      
      const outFile = path.join(outDir, `${variant.name}.jpg`);
      fs.writeFileSync(outFile, variantBuffer);
      logger.info(`✅ Variante ${variant.name} sauvegardée dans: ${outFile}`);
    }

    logger.info('\n🎉 Succès ! Tu peux maintenant vérifier les images dans le dossier basic-instinct-api/test-output');
    process.exit(0);

  } catch (err) {
    logger.error({ err }, '❌ Erreur:');
    process.exit(1);
  }
}

testLocalUpload();
