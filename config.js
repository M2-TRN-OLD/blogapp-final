'use strict';

exports.DATABASE_URL = 
  process.env.DATABASE_URL || 'mongodb://localhost/blogapp-finaldb';
  //process.env.DATABASE_URL || 'mongodb://admin:Daisl9515@ds151955.mlab.com:51955/blogapp-finaldb1'

exports.PORT = process.env.PORT || 8080;