'use strict';

const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {BlogPost, Author} = require('./models');

const app = express();
app.use(express.json());


// GET request to /blogposts
app.get('/blogposts', (req, res) => {
    console.log('made it past app.get');
    BlogPost
      .find()
      .populate('author')
      .then(posts => {
          res.json(posts.map(post => {
              return {
                  id: post._id,
                  author: post.author.firstName + ' ' + post.author.lastName,
                  firstName: post.firstName,
                  title: post.title,
                  content: post.content,
                  comments:post.comments
              };
          }));
        })
      .catch(err => {
          console.error(err);
          res.status(500).json({error:  'there is something wrong with this GET request'});
      });
});

//GET request to /blogposts by ID
app.get("/blogposts/:id", (req, res) => {
    BlogPost
      .findById(req.params.id)
      .then(blogpost => res.json(blogpost.serialize()))
      .catch(err => {
          console.error(err);
          res.status(500).json({message: "there is something wrong with GET by ID request"});
      });
});

// POST request for a new blogpost
app.post('/blogposts',(req,res) => {
    const requiredFields = ['title', 'content','author_id'];
    for (let i=0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Author
      .findById(req.body.author_id)
      .then(author => {
          console.log('author');
          console.log(author);
          if (author) {
            BlogPost
              .create({
                title: req.body.title,
                author: req.body.author_id,
                content: req.body.content
            })
              .then(blogpost => res.status(201).json({
                id: blogpost.id,
                author: `${author.firstName} ${author.lastName}`,
                content: blogpost.content,
                title: blogpost.title,
                comments: blogpost.comments
              }))
              .catch(err => {
                  console.error(err)
                  res.status(500).json({message: 'Internal server error'});
              });
          }
          else {
              const message = 'AUthor not found';
              console.error(message);
              return res.status(400).send(message);
          }
      })
      .catch(err => {
          console.error(err);
          res.status(500).json({error: 'internal server error'});
      });
});

app.put("/blogposts/:id", (req, res) => {
    if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        console.log(req.body.id);
        const message = 
          `Request path id (${req.params.id}) and request body id ` +
          `(${req.body.id}) must match`;
        console.error(message);
        return res.status(400).json({message: message});
    }

    const toUpdate = {};
    const updateableFields = ["title", "content"];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });
    console.log("toUpdate = ", JSON.stringify(toUpdate));

    BlogPost
      .findByIdAndUpdate(req.params.id, {$set: toUpdate})
      .then(blogposts => res.status(204).end())
      .catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.delete('/blogposts/:id', (req, res) => {
    BlogPost.findByIdAndRemove(req.params.id)
      .then(blogposts => res.status(204).end())
      .catch(err => res.status(500).json({message: "problem with the delete"}));
});

//Author ENDPOINTS

// GET requests to /authors
app.get('/authors', (req, res) => {
    console.log('this is a test');
      Author
      .find()
      .then(authors => {
          res.json(authors.map(author => {
              return {
                  id: author._id,
                  firstName:author.firstName,
                  lastName: author.lastName,
                  userName: author.userName
              };
          }));
      })
      .catch(err => {
          console.err(err);
          res.status(500).json({message: 'INTERNAL server error - author'});
      });
  });

// POST request to /authors 
app.post('/authors',(req,res) => {
    const requiredFields = ['firstName', 'lastName', 'userName'];
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    });

    Author
        .findOne({userName: req.body.userName})
        .then(author => {
            if (author) {
                const message = 'Username is already in use';
                console.error(message);
                return res.status(400).send(message);
            }
            else {
                Author
                    .create({
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        userName: req.body.userName
                    })
                    .then(author => res.status(201).json({
                        _id: author.id,
                        name: `${author.firstName} ${author.lastName}`,
                        userName: author.userName
                        }))
                    .catch(err => {
                        console.error(err)
                        res.status(500).json({message: 'Internal server error'});
                    });
            }    
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({error: 'internal server error - adding author'});
        });
});

//  PUT request for /authors/:id
app.put("/authors/:id", (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = `Request path id (${req.params.id}) and request body id ` +
        `(${req.body.id}) must match`;
        console.error(message);
        return res.status(400).json({message:message});
    }

    const toUpdate = {};
    const updateableFields = ["firstName", "lastName", "userName"];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });
    console.log("toUpdate = ", JSON.stringify(toUpdate));

    Author
        .findByIdAndUpdate(req.params.id, {$set: toUpdate})
        .then(author => {
            res.status(200).json( {
                id:author.id,
                name: `${author.firstName} ${author.lastName}`,
                userName: author.userName
            });
        })
        .catch(err => res.status(500).json({message: 'Internal server error - updating author'}));
});

// DELETE requests to /authors/:id
app.delete('/authors/:id', (req, res) => {
    BlogPost
        .remove({author:req.params.id})
        .then(() => {

            Author
                .findByIdAndRemove(req.params.id)
                .then(() => {
                console.log(`Deleted author with id \`${req.params.id}\``);
                res.status(204).json({message:'success'});
            });

        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "internal server error - on author delete"});
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