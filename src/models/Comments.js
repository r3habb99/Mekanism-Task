const mongoose = require("mongoose");
const commentsSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: 'Users' },
  bookId: { type: mongoose.Types.ObjectId, ref:'Books' },
  comments: { 
    type: String,  
  },
  status: { type: Boolean, default: false},
  authorId: {type: mongoose.Types.ObjectId, ref: "Users"},
});

const Comments = mongoose.model('Comment', commentsSchema);
module.exports = Comments