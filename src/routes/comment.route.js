import { Router } from 'express';

import Comment from '../controllers/comment.controller';
import checkToken from '../middleware/checkToken';

const router = Router();

router.post('/comment/:postId/create', checkToken, Comment.CreateComment);

router.put('/comment/:commentId/delete', checkToken, Comment.deleteComment);

router.get('/comment/:postId/all', checkToken, Comment.commentFeed);

router.post('/comment/:commentId/flag', checkToken, Comment.flagCommentAsInAppropriate);
export default router;
