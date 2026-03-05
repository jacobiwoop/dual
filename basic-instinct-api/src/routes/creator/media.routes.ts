import { Router } from 'express';
import { mediaController } from '../../controllers/creator/media.controller';
import { validateBody } from '../../middleware/validate';
import { uploadLimiter } from '../../middleware/rateLimiter';
import { requestUploadUrlSchema, confirmUploadSchema, createGallerySchema, editGallerySchema } from '../../schemas/media.schemas';

const router = Router();

// Upload flow
router.post('/upload-url', uploadLimiter, validateBody(requestUploadUrlSchema), mediaController.requestUploadUrl);
router.post('/confirm', uploadLimiter, validateBody(confirmUploadSchema), mediaController.confirmUpload);

// Access
router.get('/', mediaController.getMediaItems);
router.get('/galleries', mediaController.getGalleries);
router.get('/galleries/:id', mediaController.getGalleryDetails);
router.post('/galleries', validateBody(createGallerySchema), mediaController.createGallery);
router.put('/galleries/:id', validateBody(editGallerySchema), mediaController.updateGallery);
router.get('/:id/url', mediaController.getMediaUrl);

// Delete
router.delete('/:id', mediaController.deleteMedia);

// Edit
router.put('/:id', mediaController.updateMedia);

export default router;
