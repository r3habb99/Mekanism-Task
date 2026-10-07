import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            required: [true, 'Book ID is required'],
        },
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Author ID is required'],
        },
        content: {
            type: String,
            required: [true, 'Comment content is required'],
            trim: true,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: null,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

commentSchema.index({ bookId: 1, status: 1 });
commentSchema.index({ authorId: 1, status: 1 });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
