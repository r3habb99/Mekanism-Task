import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        age: { type: Number, min: 0 },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ['reader', 'author', 'admin', 'user'],
            default: 'reader',
        },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
