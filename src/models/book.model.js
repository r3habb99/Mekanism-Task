import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        content: {
            type: String,
            required: [true, 'Book content is required'],
            trim: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Author is required'],
        },
        draft: {
            type: Boolean,
            default: true,
        },
        readCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalRatings: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true }
);

// Virtual rating field for backward compatibility
bookSchema.virtual('rating').get(function () {
    return this.averageRating;
});

const Book = mongoose.model('Book', bookSchema);
export default Book;
