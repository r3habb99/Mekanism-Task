const express = require ('express');
const bodyParser = require ('body-parser');
const mongoose = require('mongoose');
const authRoutes = require ('./src/routes/users');
const bookRoutes = require('./src/routes/books')
const commentRoutes = require('./src/routes/comments')
const authMiddleware = require('./src/authMiddleware')

require('dotenv').config();

const PORT = 4000;
const app = express();
app.use(bodyParser.json())

app.use('/', () => {
    try {
        console.log('api works');
    } catch (error) {
        console.log(error)
    }
})
app.use('/api/auth',authMiddleware, authRoutes);
app.use('/api/books',authMiddleware, bookRoutes);
app.use('/api/comment',authMiddleware, commentRoutes);
app.listen(PORT, async() => {
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/books');
        console.log(`server started on port : ${PORT}`);
    }catch{
        console.log('server starting issue');
    }
})