const mongoose = require("mongoose")
const validator = require('validator');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (value) => {
                return validator.isLength(value, { min: 5, max: 100 });
            },
            message: 'Title should be between 5 and 100 characters long.',
        },
    },
    content: {
        type: String,
        required: true,
        trim: true,
    }
})

  const Post = mongoose.model('Post', postSchema);
  
  // User schema
  const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      validate: {
        validator: (value) => {
          return validator.isStrongPassword(value);
        },
        message: 'Password should be at least 6 characters long and contain a combination of letters, numbers, and special characters.',
      },
    },
  });
  
  const User = mongoose.model('User', userSchema);
  
  module.exports = { Post, User };