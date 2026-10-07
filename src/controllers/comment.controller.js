import { Comment, User, Book } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const createComment = async (req, res) => {
    try {
        const { userId, bookId, content } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return sendError(res, 404, 'User not found');
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return sendError(res, 404, 'Book not found');
        }

        const comment = await Comment.create({
            userId: user._id,
            bookId: book._id,
            content,
            authorId: book.author,
        });

        return sendSuccess(res, 201, 'Comment created successfully', comment);
    } catch (error) {
        return sendError(res, 500, 'Error creating comment', error.message);
    }
};

export const reviewComments = async (req, res) => {
    try {
        const result = await Comment.updateMany(
            { status: false },
            { $set: { status: true } }
        );

        if (result.modifiedCount === 0) {
            return sendSuccess(res, 200, 'No pending comments to review');
        }

        return sendSuccess(
            res,
            200,
            `${result.modifiedCount} comment(s) reviewed successfully`
        );
    } catch (error) {
        return sendError(res, 500, 'Error reviewing comments', error.message);
    }
};
