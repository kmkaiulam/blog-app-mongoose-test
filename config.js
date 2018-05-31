'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://kmlam:testing123@ds135540.mlab.com:35540/blogpost-app';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://kmlam:testing123@ds139970.mlab.com:39970/blogpost-test';
exports.PORT = process.env.PORT || 8080;