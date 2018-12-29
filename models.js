'use strict';

const mongoose = require('mongoose');

//these are the data schemas
//const authorSchema = mongoose.Schema({
//    lastName: String
//});

const authorSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: {
        type: String,
        unique: true
    }
});

const commentSchema = mongoose.Schema({
    content: String
});

const blogpostSchema = mongoose.Schema({
    title: String,
    content: String,
    //author: [authorSchema],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author'
    },
    comments: [commentSchema],
    created: {
        type: Date,
        default: Date.now
    }
});

blogpostSchema.pre('find', function(next) {
    this.populate('authors');
    next();
});

blogpostSchema.methods.serialize = function() {
    return {
        id:this._id,
        author: this.firstName,
        content: this.content,
        title: this.title,
        created: this.created,
        comments: this.comments
    };
};


const BlogPost = mongoose.model("Blogpost", blogpostSchema);
const Author = mongoose.model("Author", authorSchema);

module.exports = {BlogPost, Author};