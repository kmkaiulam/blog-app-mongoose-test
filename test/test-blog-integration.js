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

//seed data
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

//drop Database
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
                // otherwise our db seeding didn't work
                expect(res.body).to.have.lengthOf.at.least(1);
                return BlogPost.count();
                })
                .then(count => {
                // the number of returned posts should be same
                // as number of posts in DB
                expect(res.body).to.have.lengthOf(count);
                });
        })
        
        it('should return all blogposts with correct fields', function(){ 
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
                })

        })
    
    });

   


});
