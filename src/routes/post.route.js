import { Router } from 'express';

import Post from '../controllers/post.controller';
import checkToken from '../middleware/checkToken';

const router = Router();

router.post('/post/:orgId', checkToken, Post.CreatePost);
router.put('/post/:postId/edit', checkToken, Post.Update);
router.delete('/post/:postId/delete', checkToken, Post.deletePost);
router.get('/org/:orgId/feed', checkToken, Post.postFeed);
router.get('/post/:postId', checkToken, Post.singlePost);
export default router;
