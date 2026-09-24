const {Router} = require('express');
const Books = require('../models/Books')
const routes = new Router();

routes.post('/create', async(req,res) => {
    try {
    const { title, category, draft, author} = req.body();
    const alreadyexist = await Books.find({title});
    if(alreadyexist){
        console.log('Book already exist with this title');
    }
    if(category !== 'Novel' || category !== 'Poem'){
        console.log('Only Novel and Poem are allowed in Category');
    }
    
    
    const books = {
        title,
        category,
        draft,
        author,
    };
    const data = await Books.create(books);
    return res.status(201).json({data, message: 'Book Created Successfully'});

    } catch (error) {
        return console.log('Error in creation of book', error)
    }

});

routes.get('/view', async(req,res) => {
    try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;


    const [books, totalBooks] = await Promise.all([
      Books.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }), 
      Books.countDocuments()
    ]);

    return res.status(200).json({
      success: true,
      currentPage: page,
      limit: limit,
      totalPages: Math.ceil(totalBooks / limit),
      totalBooks: totalBooks,
      data: books
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

routes.patch('/books/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        const updates = req.body;

        const updatedBook = await Books.findByIdAndUpdate(
            bookId, 
            { $set: updates }, 
            { new: true, runValidators: true }
        );

        if (!updatedBook) {
            return res.status(404).json({ message: 'Book not found' });
        }

        return res.status(200).json(updatedBook);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

routes.delete('/books/:id', async (req, res) => {
    try {
        const bookId = req.params.id;

        await Books.deleteOne({_id: bookId})

        return res.status(200).json({message: 'Book Deleted Successfully'});
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

module.exports = routes;
