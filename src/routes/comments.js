const {Router} = require('express');
const Books = require('../models/Books')
const Users = require('../models/User');
const Comments = require('../models/Comments');
const routes = new Router();

routes.post('/createComment', async(req,res) => {
    try {
    const { userId, bookId, comments,} = req.body();
    const User = await Users.findById({_id: userId});
    const Book = await Books.findById({_id: bookId});
    const comment = {
        userId : User._id,
        bookId: Book._id,
        comments,
    };
    const data = await Comments.create(comment);
    return res.status(201).json({data, message: 'Comment Created Successfully'});

    } catch (error) {
        return res.status(500).json({ message: 'Error in creation of comment'});
    }

});

routes.patch('/reviewComment', async(req,res) => {
    try {
        const comment = await Comments.find({ status: false}); 
        const data = {
            status: true,
        }
        return res.status(200).json({ data, message: "Comment review successfully"});
    } catch (error) {
        return res.status(500).json({message: "Error in Comment"})
    }
})

module.exports = routes;