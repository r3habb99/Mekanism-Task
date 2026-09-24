const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  Name: { type: String },
  age: { type: Number },
  email:{ type: String, required : true},
  password: { type: String},
  role: {
    type: String,
    enum: ['0','1'],
    default: '1'
  }
});

const Users = mongoose.model('User', userSchema);
module.exports = Users;