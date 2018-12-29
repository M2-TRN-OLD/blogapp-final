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
    console.log('made it past app.get');
    BlogPost
      .find()
      .then(posts => {
          console.log ()
          res.json(posts.map(post => {
              console.log(post.author);
              return {
                id: post._id,
                author: post.author,
                content: post.content,
                title: post.title,
                created: post.created,
                comments: post.comments
            };
        }));
      })
      .catch(err => {
          console.error(err);
          res.status(500).json({error:  'there is something wrong with this GET request'});
      });
});

let server;

function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                console.log(`app is listening on port ${port}`);
                resolve();
            })
              .on('error', err => {
                  mongoose.disconnect();
                  reject(err);
              });
        });
    });
}

if (require.main ===module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}


module.exports = {runServer, app};