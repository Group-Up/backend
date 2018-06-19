'use strict';

import fs from 'fs-extra'; // used to remove documents

const s3Upload = (path, key) => {
  const aws = require('aws-sdk');
  const amazons3 = new aws.S3();

  const uploadOptions = {
    Bucket: process.env.AWS_BUCKET,
    Key: key,
    ACL: 'public-read',
    Body: fs.createReadStream(path), 
  };

  return amazons3.upload(uploadOptions)
    .promise() // this comes from aws and calls the interal calllback of the upload method
    .then((response) => {
      return fs.remove(path)
        .then(() => {
          return response.Location;
        }) // response.location maps to the upload url link location
        .catch(err => Promise.reject(err));
    })
    .catch((err) => {
      return fs.remove(path)
        .then(() => Promise.reject(err))
        .catch(fsErr => Promise.reject(fsErr));
    });
};

const s3Remove = (key) => {
  const aws = require('aws-sdk');
  const amazons3 = new aws.S3();

  const removeOptions = {
    Key: key,
    Bucket: process.env.AWS_BUCKET,
  };

  return amazons3.deleteObject(removeOptions).promise();
};

export { s3Upload, s3Remove };
