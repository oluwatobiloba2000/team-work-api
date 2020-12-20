import { Router } from 'express';

import Profile from '../controllers/profile.controller';
import checkToken from '../middleware/checkToken';

const router = Router();

router.get('/user', checkToken, Profile.View);
router.put('/user/edit', checkToken, Profile.Update);
router.put('/org/invite/:orgId/accept', checkToken, Profile.AcceptInviteToJoinOrg);
router.post('/org/join/:orgId', checkToken, Profile.JoinOpenOrg);

export default router;
