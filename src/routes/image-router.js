'use strict';

import multer from 'multer';
import { Router } from 'express';
import HttpError from 'http-errors';
// import logger from '../lib/logger';
import bearerAuthMiddleware from '../lib/bearer-auth-middleware';
import Image from '../model/image';
import { s3Upload, s3Remove } from '../lib/s3';

const multerUpload = multer({ dest: `${__dirname}/../temp` });

const imageRouter = new Router();

imageRouter.post('/images', bearerAuthMiddleware, multerUpload.any(), (request, response, next) => {
  if (!request.account) {
    return next(new HttpError(404, 'IMAGE ROUTER ERROR: not found'));
  }

  if (!request.body.caption || request.files.length > 1 || request.files[0].fieldname !== 'image') {
    return next(new HttpError(400, 'IMAGE ROUTER ERROR, invalid request'));
  } 

  const file = request.files[0];
  const key = `${file.filename}.${file.originalname}`;
  
  return s3Upload(file.path, key)
    .then((awsUrl) => {
      return new Image({
        caption: request.body.caption,
        account: request.account._id,
        url: awsUrl,
      }).save();
    })
    .then(image => response.json(image))
    .catch(next);
});

export default imageRouter;
