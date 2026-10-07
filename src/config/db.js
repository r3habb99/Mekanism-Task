import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }

    mongoose.connection.on('error', (err) => {
        console.error('MongoDB runtime error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected');
    });
};

export default connectDB;
