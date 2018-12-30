const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const {app, runServer, closeServer} = require('../server');
const {BlogPost, Author} = require('../models');
const {TEST_DATABASE_URL} = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);
chai.should();

function tearDownDb() {
    return new Promise((resolve, reject) => {
        console.warn('Deleting database');
        mongoose.connection.dropDatabase()
            .then(result => resolve(result))
            .catch(err => reject(err));
    });
}

function seedBlogPostData() {
    console.info('seeding blog post data');
    const seedData = [];
    for (let i = 1; i <=10; i++) {
        seedData.push({
            author: "5af50c84c082f1e92f83420b",
            title: faker.lorem.sentence(),
            content: faker.lorem.text()
        });
    }
    return BlogPost.insertMany(seedData);
}


describe("Blogposts API resource", function() {

    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return seedBlogPostData();
    });

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });

    describe("GET endpoint", function() {

        it('should return all existing posts', function() {
            // strategy:
            //  1.  get back all posts returned by the GET request to `/blogposts`
            //  2.  prove res (the response object) has the right status and data type
            //  3.  prove the number of blogposts we got back is equal to the number in the database.
            let res;
            return chai
                .request(app)
                .get('/blogposts')
                .then(_res => {
                    res = _res;
                    res.should.have.status(200);
                    res.body.should.have.lengthOf.at.least(1);
                    return BlogPost.count();
                })
                .then(count => {
                    expect(res).body.should.have.lengthOf(count);
                });
        });

        it('should return with all the right keys', function() {
            // strategy:  get back all the posts and ensure that each post has the expected keys

            let resPost;
            return chai.request(app)
                .get('/blogposts')
                .then(function(res) {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('array');
                        res.body.should.have.lengthOf.at.least(1);
                        res.body.forEach(function(post) {
                            console.log(post);
                            post.should.be.a('object');
                            post.should.include.keys('id', 'title', 'content', 'author', 'created');
                    });
                    resPost = res.body[0];
                    return BlogPost.findById(resPost.id);
                })
                .then(post => {
                    resPost.title.should.equal(post.title);
                    resPost.content.should.equal(post.content);
                    resPost.author.should.equal(post.author);
                });
        });
    });
});