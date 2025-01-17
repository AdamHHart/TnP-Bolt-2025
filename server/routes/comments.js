import express from 'express';
import { getPostComments, createComment } from '../controllers/comments.controller.js';

const router = express.Router();

router.get('/post/:postId', getPostComments);
router.post('/', createComment);

export const commentsRouter = router;