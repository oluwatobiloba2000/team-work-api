import { Router } from 'express';
import UploadGif from '../controllers/gif.upload.controller';

import Uplaod from '../controllers/upload.controller';
import checkToken from '../middleware/checkToken';

const router = Router();

// for uploading photos
router.post('/upload', checkToken, Uplaod.upLoadphoto);

router.post('/gif/upload', checkToken, UploadGif.upLoad);
export default router;
