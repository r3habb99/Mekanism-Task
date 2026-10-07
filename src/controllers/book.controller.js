import { Book } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const createBook = async (req, res) => {
    try {
        const { title, category, draft, author } = req.body;

        const existingBook = await Book.findOne({ title });
        if (existingBook) {
            return sendError(res, 409, 'Book already exists with this title');
        }

        const book = await Book.create({ title, category, draft, author });

        return sendSuccess(res, 201, 'Book created successfully', book);
    } catch (error) {
        return sendError(res, 500, 'Error creating book', error.message);
    }
};

export const getBooks = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;

        const [books, totalBooks] = await Promise.all([
            Book.find()
                .populate('author', 'name email')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Book.countDocuments(),
        ]);

        return sendSuccess(res, 200, 'Books retrieved successfully', {
            books,
            pagination: {
                currentPage: page,
                limit,
                totalPages: Math.ceil(totalBooks / limit),
                totalBooks,
            },
        });
    } catch (error) {
        return sendError(res, 500, 'Error fetching books', error.message);
    }
};

export const updateBook = async (req, res) => {
    try {
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedBook) {
            return sendError(res, 404, 'Book not found');
        }

        return sendSuccess(res, 200, 'Book updated successfully', updatedBook);
    } catch (error) {
        return sendError(res, 400, 'Error updating book', error.message);
    }
};

export const deleteBook = async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.id);

        if (!deletedBook) {
            return sendError(res, 404, 'Book not found');
        }

        return sendSuccess(res, 200, 'Book deleted successfully');
    } catch (error) {
        return sendError(res, 500, 'Error deleting book', error.message);
    }
};
