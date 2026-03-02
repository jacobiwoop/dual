import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME } from '../lib/r2';
import logger from '../lib/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testR2UploadOnly() {
  try {
    logger.info(`🔌 Connecting to Cloudflare R2 bucket: ${R2_BUCKET_NAME}`);

    // 1. Trouver une image locale
    const projectRoot = path.join(__dirname, '..', '..', '..');
    const imageFiles = ['image.png', 'image.jpg', 'image.jpeg'].map(f => path.join(projectRoot, f));
    
    let testImagePath: string | null = null;
    for (const imgPath of imageFiles) {
      if (fs.existsSync(imgPath)) {
        testImagePath = imgPath;
        break;
      }
    }

    if (!testImagePath) {
      logger.error('❌ Aucune image trouvée à la racine pour tester.');
      process.exit(1);
    }

    const imageBuffer = fs.readFileSync(testImagePath);
    const fileName = path.basename(testImagePath);
    const fileExt = path.extname(testImagePath);
    
    logger.info(`✅ Image prête pour upload: ${fileName} (${(imageBuffer.length / 1024).toFixed(2)} KB)`);

    // 2. Upload vers R2
    const uploadKey = `test-upload-only/hello-r2-${Date.now()}${fileExt}`;
    logger.info(`📤 Uploading to R2 key: ${uploadKey}`);

    const uploadCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: uploadKey,
      Body: imageBuffer,
      ContentType: `image/${fileExt.replace('.', '')}`,
    });

    await r2Client.send(uploadCommand);
    logger.info('✅ Upload terminé avec succès !');

    // 3. Vérification de présence
    logger.info('🔍 Vérification de la présence sur R2...');
    const getCommand = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: uploadKey,
    });
    
    const getResult = await r2Client.send(getCommand);
    logger.info(`✅ Confirmé ! Le fichier est bien sur Cloudflare R2.`);
    logger.info(`\n🎉 Va voir ton interface R2.`);
    logger.info(`📁 Bucket : ${R2_BUCKET_NAME}`);
    logger.info(`📁 Dossier: test-upload-only/`);
    logger.info(`📄 Fichier: ${uploadKey.split('/').pop()}`);

  } catch (error: any) {
    logger.error('❌ Erreur lors du test R2:', error);
    if (error.Code === 'InvalidAccessKeyId' || error.Code === 'SignatureDoesNotMatch') {
      logger.error('👉 Vérifie tes identifiants R2 (ACCOUNT_ID, ACCESS_KEY, SECRET_KEY) dans le fichier .env');
    }
  }
}

testR2UploadOnly();
