process.env.NODE_ENV = 'development';
process.env.PORT = 7000;
process.env.MONGODB_URI = 'mongodb://localhost/testing';
process.env.MY_LAB_SECRET = 'duSC4Se8mgtqyfmmT129iyQuH0jMOxLdZcbQMmZHgUcTJC4wLBQlbLC1Hi5eJNeGgKYvbDesHcdD7rdJHJeEvTHqAFJIB56Bepk';

const isAwsMock = true;

if (isAwsMock) {
  process.env.AWS_BUCKET = 'fake';
  process.env.AWS_SECRET_ACCESS_KEY = 'fakeasdfasdfsafdsafsadfasfasdfsadfsadfsadfdsafas';
  process.env.AWS_ACCESS_KEY_ID = 'fakekeyinsidetestenv';
  require('./setup');
} else {
  // remember to set your .env vars and add .env to .gitignore
  require('dotenv').config();
}
