import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            required: true,
        },
        content: { type: String, required: true, trim: true },
        status: { type: Boolean, default: false },
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
