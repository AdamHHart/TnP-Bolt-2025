import express from 'express';
import { getUserProfile } from '../controllers/users.controller.js';

const router = express.Router();

router.get('/:id', getUserProfile);

export const usersRouter = router;