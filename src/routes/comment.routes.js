import { Router } from 'express';
import { createComment, reviewComments } from '../controllers/comment.controller.js';
import { validateCreateComment } from '../validators/comment.validator.js';

const router = Router();

router.post('/create', validateCreateComment, createComment);
router.patch('/review', reviewComments);

export default router;
