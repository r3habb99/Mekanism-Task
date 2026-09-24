const mongoose = require("mongoose");
const bookSchema = new mongoose.Schema({
  title: { type: String },
  category: { type: String, enum: ['Novel', 'Poem'] },
  rating: { 
    type: String, 
    enum: ['1', '2', '3'], 
  },
  draft: { type: Boolean, default: false},
  author: {type: mongoose.Types.ObjectId, ref: "Users"},
  comments:{
    type: String
  }
});

const Books = mongoose.model('Book', bookSchema);
module.exports = Books