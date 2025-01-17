import express from 'express';
import { getPosts, createPost } from '../controllers/posts.controller.js';

const router = express.Router();

router.get('/', getPosts);
router.post('/', createPost);

export const postsRouter = router;