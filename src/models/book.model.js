import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        category: {
            type: String,
            enum: ['Novel', 'Poem'],
            required: true,
        },
        rating: {
            type: Number,
            enum: [1, 2, 3],
            default: 1,
        },
        draft: { type: Boolean, default: false },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

const Book = mongoose.model('Book', bookSchema);
export default Book;
