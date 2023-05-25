require('dotenv').config();
const express = require('express');
require('./db/conn');
const { Post, User } = require('../models/students');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const sec_key = process.env.JWT_SECRET

const app = express();

app.use(express.json())

const port = process.env.PORT || 8080;

// const JWT_SECRET =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNzaGl2YW0zNzY1QGdtYWlsLmNvbSIsImlhdCI6MTY4NTAxMzc4OH0.6FwJR9rGBRgYeB8f0Uxmk0lV94u5okas78Ruprr-BM8"

function verifyToken(req, res, next) {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided.' });
    }
  
    jwt.verify(token, sec_key , (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token.' });
      }
  
      req.user = decoded;
      next();
    });
  }

app.get('/', (req, res) => {
    res.send("This is home page...")
})

// User registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
  
    const newUser = new User({ username, password });
  
    newUser.save()
      .then(() => {
        res.status(201).json({ message: 'User registered successfully.' });
      })
      .catch((error) => {
        if (error.errors) {
          const validationErrors = Object.values(error.errors).map((err) => err.message);
          return res.status(400).json({ message: 'Validation error.', errors: validationErrors });
        }
  
        res.status(500).json({ message: 'Failed to register user.', error });
      });
  });
  
  // User login
  app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
  
    User.findOne({ username })
      .then((user) => {
        if (!user || user.password !== password) {
          return res.status(401).json({ message: 'Invalid username or password.' });
        }
  
        const token = jwt.sign({ username: user.username }, 'your-secret-key');
  
        res.json({ token });
      })
      .catch((error) => {
        res.status(500).json({ message: 'Failed to authenticate user.', error });
      });
  });
  
  // Create a new post
  app.post('/posts', verifyToken, (req, res) => {
    const { title, content } = req.body;
  
    const errors = [];
    if (!title || !validator.isLength(title, { min: 5, max: 100 })) {
      errors.push('Title should be between 5 and 100 characters long.');
    }
    if (!content) {
      errors.push('Content is required.');
    }
  
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation error.', errors });
    }
  
    const newPost = new Post({ title, content });
  
    newPost.save()
      .then((post) => {
        res.status(201).json({ message: 'Post created successfully.', post });
      })
      .catch((error) => {
        res.status(500).json({ message: 'Failed to create post.', error });
      });
  });
  
  // Read a specific post
  app.get('/posts/:id', verifyToken, (req, res) => {
    const postId = req.params.id;
  
    Post.findById(postId)
      .then((post) => {
        if (!post) {
          return res.status(404).json({ message: 'Post not found.' });
        }
  
        res.json({ post });
      })
      .catch((error) => {
        res.status(500).json({ message: 'Failed to retrieve post.', error });
      });
  });
  
  // Update a post
  app.put('/posts/:id', verifyToken, (req, res) => {
    const postId = req.params.id;
    const { title, content } = req.body;
  
    const errors = [];
    if (!title || !validator.isLength(title, { min: 5, max: 100 })) {
      errors.push('Title should be between 5 and 100 characters long.');
    }
    if (!content) {
      errors.push('Content is required.');
    }
  
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation error.', errors });
    }
  
    Post.findByIdAndUpdate(postId, { title, content }, { new: true })
      .then((post) => {
        if (!post) {
          return res.status(404).json({ message: 'Post not found.' });
        }
  
        res.json({ message: 'Post updated successfully.', post });
      })
      .catch((error) => {
        res.status(500).json({ message: 'Failed to update post.', error });
      });
  });
  
  // Delete a post
  app.delete('/posts/:id', verifyToken, (req, res) => {
    const postId = req.params.id;
  
    Post.findByIdAndDelete(postId)
      .then((post) => {
        if (!post) {
          return res.status(404).json({ message: 'Post not found.' });
        }
  
        res.json({ message: 'Post deleted successfully.' });
      })
      .catch((error) => {
        res.status(500).json({ message: 'Failed to delete post.', error });
      });
  });
  
  
app.listen(port, () => {
    console.log(`Server running on port no. ${port}`);
})