'use strict';

const mongoose = require('mongoose');

//these are the data schemas
const authorSchema = mongoose.Schema({
    lastName: String
});

const commentSchema = mongoose.Schema({
    content: String
});

const blogpostSchema = mongoose.Schema({
    title: String,
    content: String,
    author: [authorSchema],
    comments: [commentSchema],
    created: {
        type: Date,
        default: Date.now
    }
});

blogpostSchema.methods.serialize = function() {
    return {
        id:this._id,
        //author: this.firstName,
        content: this.content,
        title: this.title,
        created: this.created,
        comments: this.comments
    };
};


const BlogPost = mongoose.model("Blogpost", blogpostSchema);

module.exports = {BlogPost};