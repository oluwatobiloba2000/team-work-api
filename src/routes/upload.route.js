import { Router } from 'express';

import Uplaod from '../controllers/upload.controller';
import checkToken from '../middleware/checkToken';

const router = Router();

router.post('/upload', checkToken, Uplaod.upLoadphoto);

export default router;
