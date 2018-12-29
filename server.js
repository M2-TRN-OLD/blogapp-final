'use strict';

const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {BlogPost} = require('./models');

const app = express();
app.use(express.json());

// GET request to /blogposts
app.get('/blogposts', (req, res) => {
    BlogPost
      .find()
      .then(posts => {
          res.json(posts.map(post => post.serialize()));
      })
      .catch(err => {
          console.error(err);
          res.status(500).json({error:  'there is something wrong with this GET request'});
      });
});

module.exports = {app};