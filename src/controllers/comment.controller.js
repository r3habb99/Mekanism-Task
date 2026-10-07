import mongoose from 'mongoose';
import { Comment, Book } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Helper function to recalculate average rating for a book based on approved reviews.
 */
const recalculateBookRating = async (bookId) => {
    const stats = await Comment.aggregate([
        {
            $match: {
                bookId: new mongoose.Types.ObjectId(bookId),
                status: 'approved',
                rating: { $ne: null, $gte: 1, $lte: 5 },
            },
        },
        {
            $group: {
                _id: '$bookId',
                totalRatings: { $sum: 1 },
                averageRating: { $avg: '$rating' },
            },
        },
    ]);

    if (stats.length > 0) {
        await Book.findByIdAndUpdate(bookId, {
            averageRating: Math.round(stats[0].averageRating * 10) / 10,
            totalRatings: stats[0].totalRatings,
        });
    } else {
        await Book.findByIdAndUpdate(bookId, {
            averageRating: 0,
            totalRatings: 0,
        });
    }
};

/**
 * Reader creates a comment / rating on a book (starts with status: 'pending').
 */
export const createComment = async (req, res) => {
    try {
        const { bookId, content, rating } = req.body;

        const book = await Book.findById(bookId);
        if (!book) {
            return sendError(res, 404, 'Book not found');
        }

        const comment = await Comment.create({
            userId: req.user.id,
            bookId: book._id,
            authorId: book.author,
            content: content.trim(),
            rating: rating !== undefined ? Number(rating) : null,
            status: 'pending',
        });

        const populatedComment = await Comment.findById(comment._id)
            .populate('userId', 'name email')
            .populate('bookId', 'title');

        return sendSuccess(
            res,
            201,
            'Comment submitted successfully. It will be visible once approved by the author.',
            populatedComment
        );
    } catch (error) {
        return sendError(res, 500, 'Error creating comment', error.message);
    }
};

/**
 * Author gets pending comments for their books to moderate.
 */
export const getPendingComments = async (req, res) => {
    try {
        const filter = { status: 'pending' };
        if (req.user.role !== 'admin') {
            filter.authorId = req.user.id;
        }

        const comments = await Comment.find(filter)
            .populate('userId', 'name email')
            .populate('bookId', 'title')
            .sort({ createdAt: -1 });

        return sendSuccess(
            res,
            200,
            'Pending comments retrieved successfully',
            comments
        );
    } catch (error) {
        return sendError(res, 500, 'Error fetching pending comments', error.message);
    }
};

/**
 * Author moderates a comment (approve or reject).
 */
export const moderateComment = async (req, res) => {
    try {
        const { status } = req.body;
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return sendError(res, 404, 'Comment not found');
        }

        // Ownership check: only the book's author or admin can moderate
        if (
            comment.authorId.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return sendError(
                res,
                403,
                'Forbidden: You can only moderate comments for your own books'
            );
        }

        comment.status = status;
        await comment.save();

        // Update book rating if comment included a rating
        if (comment.rating) {
            await recalculateBookRating(comment.bookId);
        }

        const updatedComment = await Comment.findById(comment._id)
            .populate('userId', 'name email')
            .populate('bookId', 'title');

        return sendSuccess(
            res,
            200,
            `Comment has been ${status} successfully`,
            updatedComment
        );
    } catch (error) {
        return sendError(res, 500, 'Error moderating comment', error.message);
    }
};

/**
 * Get approved comments for a book.
 */
export const getBookComments = async (req, res) => {
    try {
        const bookId = req.params.bookId || req.params.id;

        const comments = await Comment.find({
            bookId,
            status: 'approved',
        })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        return sendSuccess(
            res,
            200,
            'Approved comments retrieved successfully',
            comments
        );
    } catch (error) {
        return sendError(res, 500, 'Error fetching comments', error.message);
    }
};

/**
 * Backward compatibility for reviewComments (approves pending comments for the author).
 */
export const reviewComments = async (req, res) => {
    try {
        const filter = { status: 'pending' };
        if (req.user.role !== 'admin') {
            filter.authorId = req.user.id;
        }

        const pendingComments = await Comment.find(filter);
        if (pendingComments.length === 0) {
            return sendSuccess(res, 200, 'No pending comments to review');
        }

        await Comment.updateMany(filter, { $set: { status: 'approved' } });

        // Recalculate ratings for all impacted books
        const affectedBookIds = [...new Set(pendingComments.map((c) => c.bookId.toString()))];
        for (const bookId of affectedBookIds) {
            await recalculateBookRating(bookId);
        }

        return sendSuccess(
            res,
            200,
            `${pendingComments.length} comment(s) approved successfully`
        );
    } catch (error) {
        return sendError(res, 500, 'Error reviewing comments', error.message);
    }
};
