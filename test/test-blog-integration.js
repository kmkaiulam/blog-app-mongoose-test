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
    }
    return BlogPost.insertMany(seedData);
}

function generateBlogPost(){
    return {
        author: {
            firstName: faker.name.firstName ,
            lastName:  faker.name.lastName
            },
        title: faker.name.title, 
        content: faker.lorem.paragraph,
        created: faker.date.recent
    }
}