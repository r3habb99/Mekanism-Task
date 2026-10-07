import { Router } from 'express';
import authRoutes from './auth.routes.js';
import bookRoutes from './book.routes.js';
import categoryRoutes from './category.routes.js';
import commentRoutes from './comment.routes.js';

const router = Router();

// Centralized sub-routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/books', bookRoutes);
router.use('/comments', commentRoutes);

export default router;
