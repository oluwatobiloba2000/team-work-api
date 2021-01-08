/* eslint-disable max-len */
import { Router } from 'express';

import Post from '../controllers/post.controller';
import checkToken from '../middleware/checkToken';

const router = Router();

router.post('/post/:orgId/create', checkToken, Post.CreatePost);

router.put('/post/:postId/edit', checkToken, Post.Update);

router.delete('/post/:postId/delete', checkToken, Post.deletePost);

router.get('/org/:orgId/feed', checkToken, Post.postFeed);

router.get('/post/:postId', checkToken, Post.singlePost);

router.post('/post/:postId/flag', checkToken, Post.flagPostAsInAppropriate);

router.get('/org/:orgId/tag/feed', checkToken, Post.postByTagFeed);
export default router;
