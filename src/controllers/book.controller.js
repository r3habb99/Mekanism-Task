import mongoose from 'mongoose';
import { Book, Category, Comment } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const createBook = async (req, res) => {
    try {
        const { title, description, content, category, draft } = req.body;

        // Verify category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return sendError(res, 404, 'Category not found');
        }

        const existingBook = await Book.findOne({
            title: { $regex: new RegExp(`^${title.trim()}$`, 'i') },
        });
        if (existingBook) {
            return sendError(res, 409, 'A book already exists with this title');
        }

        // Default draft to true if not specified
        const isDraft = draft !== undefined ? draft : true;

        const book = await Book.create({
            title: title.trim(),
            description: description?.trim() || '',
            content: content.trim(),
            category,
            draft: isDraft,
            author: req.user.id,
        });

        const populatedBook = await Book.findById(book._id)
            .populate('author', 'name email')
            .populate('category', 'name description');

        return sendSuccess(res, 201, 'Book created successfully', populatedBook);
    } catch (error) {
        return sendError(res, 500, 'Error creating book', error.message);
    }
};

export const getBooks = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;

        const { category, minRating, search, sortBy } = req.query;

        // Public/Readers can only see published books
        const filter = { draft: false };

        // Filter by category (by ID or name)
        if (category) {
            if (mongoose.Types.ObjectId.isValid(category)) {
                filter.category = category;
            } else {
                const foundCategory = await Category.findOne({
                    name: { $regex: new RegExp(`^${category.trim()}$`, 'i') },
                });
                if (foundCategory) {
                    filter.category = foundCategory._id;
                } else {
                    // Category name doesn't match any category
                    return sendSuccess(res, 200, 'Books retrieved successfully', {
                        books: [],
                        pagination: {
                            currentPage: page,
                            limit,
                            totalPages: 0,
                            totalBooks: 0,
                        },
                    });
                }
            }
        }

        // Filter by rating
        if (minRating !== undefined && !isNaN(minRating)) {
            filter.averageRating = { $gte: Number(minRating) };
        }

        // Search by title or description
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        // Sort options (popularity, rating, latest)
        let sortOption = { createdAt: -1 };
        if (sortBy === 'popularity') {
            sortOption = { readCount: -1 };
        } else if (sortBy === 'rating') {
            sortOption = { averageRating: -1 };
        }

        const [books, totalBooks] = await Promise.all([
            Book.find(filter)
                .select('-content') // Exclude full content in listing
                .populate('author', 'name email')
                .populate('category', 'name description')
                .skip(skip)
                .limit(limit)
                .sort(sortOption),
            Book.countDocuments(filter),
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

export const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('author', 'name email')
            .populate('category', 'name description');

        if (!book) {
            return sendError(res, 404, 'Book not found');
        }

        // If the book is a draft, only its author or an admin can view it
        if (book.draft) {
            const isAuthor = req.user && book.author._id.toString() === req.user.id;
            const isAdmin = req.user && req.user.role === 'admin';
            if (!isAuthor && !isAdmin) {
                return sendError(
                    res,
                    403,
                    'This book is currently in draft and not yet published'
                );
            }
        }

        return sendSuccess(res, 200, 'Book retrieved successfully', book);
    } catch (error) {
        return sendError(res, 500, 'Error fetching book', error.message);
    }
};

/**
 * Reader reads the book: increments readCount and returns the full content.
 */
export const readBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('author', 'name email')
            .populate('category', 'name description');

        if (!book) {
            return sendError(res, 404, 'Book not found');
        }

        // If draft, only author/admin can read
        if (book.draft) {
            const isAuthor = req.user && book.author._id.toString() === req.user.id;
            const isAdmin = req.user && req.user.role === 'admin';
            if (!isAuthor && !isAdmin) {
                return sendError(res, 403, 'This book is a draft and cannot be read yet');
            }
        }

        // Atomically increment readCount
        book.readCount += 1;
        await book.save();

        return sendSuccess(res, 200, 'Book retrieved for reading', book);
    } catch (error) {
        return sendError(res, 500, 'Error reading book', error.message);
    }
};

/**
 * Author publishes their draft book.
 */
export const publishBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return sendError(res, 404, 'Book not found');
        }

        // Ownership check
        if (book.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return sendError(res, 403, 'Forbidden: You can only publish your own books');
        }

        book.draft = false;
        await book.save();

        const updatedBook = await Book.findById(book._id)
            .populate('author', 'name email')
            .populate('category', 'name description');

        return sendSuccess(res, 200, 'Book published successfully', updatedBook);
    } catch (error) {
        return sendError(res, 500, 'Error publishing book', error.message);
    }
};

/**
 * Author gets all their authored books (including drafts).
 */
export const getMyBooks = async (req, res) => {
    try {
        const books = await Book.find({ author: req.user.id })
            .populate('category', 'name description')
            .sort({ createdAt: -1 });

        return sendSuccess(res, 200, 'Author books retrieved successfully', books);
    } catch (error) {
        return sendError(res, 500, 'Error fetching your books', error.message);
    }
};

export const updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return sendError(res, 404, 'Book not found');
        }

        // Ownership check
        if (book.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return sendError(res, 403, 'Forbidden: You can only edit your own books');
        }

        // If category is being updated, verify it exists
        if (req.body.category) {
            const categoryExists = await Category.findById(req.body.category);
            if (!categoryExists) {
                return sendError(res, 404, 'Category not found');
            }
        }

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        )
            .populate('author', 'name email')
            .populate('category', 'name description');

        return sendSuccess(res, 200, 'Book updated successfully', updatedBook);
    } catch (error) {
        return sendError(res, 400, 'Error updating book', error.message);
    }
};

export const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return sendError(res, 404, 'Book not found');
        }

        // Ownership check
        if (book.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return sendError(res, 403, 'Forbidden: You can only delete your own books');
        }

        await Book.findByIdAndDelete(req.params.id);
        // Clean up comments associated with this book
        await Comment.deleteMany({ bookId: req.params.id });

        return sendSuccess(res, 200, 'Book deleted successfully');
    } catch (error) {
        return sendError(res, 500, 'Error deleting book', error.message);
    }
};
