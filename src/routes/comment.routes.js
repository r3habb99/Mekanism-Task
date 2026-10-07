import { Router } from 'express';
import {
    createComment,
    getPendingComments,
    moderateComment,
    getBookComments,
    reviewComments,
} from '../controllers/comment.controller.js';
import {
    validateCreateComment,
    validateModerateComment,
    validateCommentId,
} from '../validators/comment.validator.js';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Reader comments / ratings
router.post('/', authMiddleware, validateCreateComment, createComment);
router.post('/create', authMiddleware, validateCreateComment, createComment); // Backward compatibility

// Public / Reader: View approved comments for a book
router.get('/book/:bookId', getBookComments);

// Author Moderation routes
router.get(
    '/pending',
    authMiddleware,
    authorizeRoles('author', 'admin'),
    getPendingComments
);

router.patch(
    '/:id/moderate',
    authMiddleware,
    authorizeRoles('author', 'admin'),
    validateCommentId,
    validateModerateComment,
    moderateComment
);

router.patch(
    '/review',
    authMiddleware,
    authorizeRoles('author', 'admin'),
    reviewComments
); // Backward compatibility

export default router;
