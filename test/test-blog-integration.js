'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require ('../server')
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);


function seedBlogData(){
    console.info('seeding blog data');
    const seedData = [];

    for (let i = 1; i<=10; i++){
        seedData.push(generateBlogPost());
    return BlogPost.insertMany(seedData);
    }
}

function generateBlogPost(){
    return {
        author: {
            firstName: faker.name.firstName() ,
            lastName:  faker.name.lastName()
            },
        title: faker.name.title(), 
        content: faker.lorem.paragraph(),
    }
}


function dropDatabase(){
    console.warn('Deleting Database');
    return mongoose.connection.dropDatabase();
}

describe('Blog API resource', function(){
    
    before(function(){
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function(){
        return seedBlogData();
    });

   afterEach(function(){
        return dropDatabase();
    });

    after(function(){
        return closeServer();
    });


    
    describe('GET endpoint', function(){

        it('should return all blogposts', function(){
            let res;
            return chai.request(app)
                .get('/posts')
                .then(_res => {
                res = _res;
                expect(res).to.have.status(200);
        
                expect(res.body).to.have.lengthOf.at.least(1);
                return BlogPost.count();
                })
                .then(count => {
               
                expect(res.body).to.have.lengthOf(count);
                });
        })
        
        it('should return blogposts with correct fields', function(){ 
            let resPost;
            return chai.request(app)
                .get('/posts')
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;

                res.body.forEach(function (post){
                    expect(post).to.be.a('object');
                    expect(post).to.include.keys('id', 'title', 'content', 'author', 'created');
                });
                resPost = res.body[0];
                return BlogPost.findById(resPost.id);
            })
                .then(post => {
                    expect(resPost.title).to.equal(post.title);
                    expect(resPost.content).to.equal(post.content);
                    expect(resPost.author).to.equal(post.authorName);
                    expect(Date(resPost.created)).to.equal(Date(post.created));
                    expect(resPost.id).to.equal(String(post._id));
                })

        })

    });


    describe('POST endpoint', function(){

        it('should return a blogpost that corresponds with all the user entries', function(){
            let newPostRes;
            let fakedPost = {
                author: {
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                    },
                title: faker.name.title(),
                content: faker.lorem.paragraph(),
            }
            return chai.request(app)
            .post('/posts')
            .send(fakedPost)
            .then(res => {
                expect(res).to.have.status(201);
                expect(res).to.be.json
                
                newPostRes = res.body;

                expect(newPostRes).to.be.a('object');
                expect(newPostRes).to.include.keys('id', 'title', 'content', 'author', 'created');
                expect(newPostRes.title).to.equal(fakedPost.title);
                expect(newPostRes.content).to.equal(fakedPost.content);
                expect(newPostRes.author).to.equal(`${fakedPost.author.firstName} ${fakedPost.author.lastName}`);
            return BlogPost.findById(newPostRes.id)
                })
            .then (post => {
                expect(newPostRes.id).to.equal(post.id);
                expect(Date(newPostRes.created)).to.equal(Date(post.created));
            });
        });
    });

    describe('PUT endpoint', function(){
       
       it('should update a blogpost, changing only the fields edited by user', function(){
            let postUpdate = {
                author: {
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                    },
                title: faker.name.title(),
                content: faker.lorem.paragraph(),
            }
            return chai.request(app)
            .get('/posts')
            .then(res => {
                postUpdate.id = res.body[0].id;
                
            return BlogPost.findById(res.body[0].id)
            })
            .then(post => { 
            return chai.request(app)
            .put(`/posts/${post.id}`)
            .send(postUpdate)
            })
            .then(res => {
                expect(res).to.be.status(204);
            return BlogPost.findById(postUpdate.id)
            })
            .then(post => {
                expect(post).to.be.a('object');
                expect(post.title).to.equal(postUpdate.title);
                expect(post.author).to.deep.include(postUpdate.author); 
                expect(post.content).to.equal(postUpdate.content);
            });    
        });
    });

    describe('DELETE endpoint', function (){
        
        it('should delete a blogpost', function(){
            let idDelete;
            return chai.request(app)
            .get('/posts')
            .then(res => {
            return res.body[0].id;
            })
            .then(postId => {
            return chai.request(app)
            .delete(`/posts/${postId}`);
                idDelete = postId;
            })
            .then(res => {
                expect(res).to.be.status(204);
            return BlogPost.findById(idDelete);
            })
            .then(response => {
                 expect(response).to.be.null;
            });
        });
    });
});
   



