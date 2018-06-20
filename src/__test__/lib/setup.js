'use strict';

import faker from 'faker';
import * as awsSDKMock from 'aws-sdk-mock';

// params is equal to whatever options are passed into the original method
// in this case params is equal to uploadOptions in s3Upload.
awsSDKMock.mock('S3', 'upload', (params, callback) => {
  if (!params.Key || !params.Bucket || !params.Body || !params.ACL) {
    return callback(new Error('SETUP AWS MOCK ERROR: key, bucket, body, and ACL required'));
  }

  if (params.ACL !== 'public-read') {
    return callback(new Error('SETUP AWS MOCK ERROR: ACL should be public-read'));
  }

  if (params.Bucket !== process.env.AWS_BUCKET) {
    return callback(new Error('SETUP AWS MOCK ERROR: wrong bucket'));
  }

  // this callback also has (err, data) signature
  return callback(null, { Location: faker.internet.url() });
});

awsSDKMock.mock('S3', 'deleteObject', (params, callback) => {
  if (!params.Key || !params.Bucket) {
    return callback(new Error('SETUP AWS MOCK ERROR DELETE: key and bucket required'));
  }

  if (params.Bucket !== process.env.AWS_BUCKET) {
    return callback(new Error('SETUP AWS MOCK ERROR DELETE: wrong bucket'));
  }

  return callback(null, 'successful deletion in aws mock');
});
