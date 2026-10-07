import { Router } from 'express';
import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} from '../controllers/category.controller.js';
import {
    validateCreateCategory,
    validateUpdateCategory,
    validateCategoryId,
} from '../validators/category.validator.js';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes for browsing categories
router.get('/', getCategories);
router.get('/:id', validateCategoryId, getCategoryById);

// Protected routes (Author / Admin can manage categories)
router.post(
    '/',
    authMiddleware,
    authorizeRoles('author', 'admin'),
    validateCreateCategory,
    createCategory
);

router.put(
    '/:id',
    authMiddleware,
    authorizeRoles('author', 'admin'),
    validateCategoryId,
    validateUpdateCategory,
    updateCategory
);

router.patch(
    '/:id',
    authMiddleware,
    authorizeRoles('author', 'admin'),
    validateCategoryId,
    validateUpdateCategory,
    updateCategory
);

router.delete(
    '/:id',
    authMiddleware,
    authorizeRoles('admin', 'author'),
    validateCategoryId,
    deleteCategory
);

export default router;
