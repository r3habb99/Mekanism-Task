import { Router } from 'express';
import {
    createBook,
    getBooks,
    getBookById,
    readBook,
    publishBook,
    getMyBooks,
    updateBook,
    deleteBook,
} from '../controllers/book.controller.js';
import { getBookComments } from '../controllers/comment.controller.js';
import {
    validateCreateBook,
    validateUpdateBook,
    validateBookId,
} from '../validators/book.validator.js';
import {
    authMiddleware,
    optionalAuth,
    authorizeRoles,
} from '../middlewares/auth.middleware.js';

const router = Router();

// Public / Reader browsing routes
router.get('/', optionalAuth, getBooks);
router.get('/view', optionalAuth, getBooks); // Backward compatibility
router.get('/my-books', authMiddleware, authorizeRoles('author', 'admin'), getMyBooks);
router.get('/:id', optionalAuth, validateBookId, getBookById);
router.get('/:id/comments', validateBookId, getBookComments);

// Read book route (increments readCount, returns content)
router.get('/:id/read', authMiddleware, validateBookId, readBook);

// Author actions
router.post(
    '/',
    authMiddleware,
    authorizeRoles('author', 'admin'),
    validateCreateBook,
    createBook
);
router.post(
    '/create',
    authMiddleware,
    authorizeRoles('author', 'admin'),
    validateCreateBook,
    createBook
); // Backward compatibility

router.patch(
    '/:id/publish',
    authMiddleware,
    authorizeRoles('author', 'admin'),
    validateBookId,
    publishBook
);

router.patch(
    '/:id',
    authMiddleware,
    authorizeRoles('author', 'admin'),
    validateBookId,
    validateUpdateBook,
    updateBook
);

router.delete(
    '/:id',
    authMiddleware,
    authorizeRoles('author', 'admin'),
    validateBookId,
    deleteBook
);

export default router;
