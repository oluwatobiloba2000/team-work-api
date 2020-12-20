import { Router } from 'express';

import Admin from '../controllers/admin.controller';
import checkToken from '../middleware/checkToken';

const router = Router();

// to vie all flagged comments
router.get('/comment/:orgId/flagged', checkToken, Admin.viewFlaggedComments);

// to view all flagged post
router.get('/post/:orgId/flagged', checkToken, Admin.viewFlaggedPosts);

// to delete falgged post
router.delete('/post/:orgId/flagged/:postId/delete', checkToken, Admin.deleteFlaggedPost);

// to delete flagged comment
router.delete('/comment/:orgId/flagged/:commentId/delete', checkToken, Admin.deleteFlaggedComment);

router.post('/org/:orgId/invite', checkToken, Admin.inviteUser);
export default router;
