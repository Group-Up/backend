'use strict';

import multer from 'multer';
import { Router } from 'express';
import { json } from 'body-parser';
import HttpError from 'http-errors';
import { s3Upload } from '../lib/s3';
import Post from '../model/post';
import logger from '../lib/logger';
import Profile from '../model/profile';
import bearerAuthMiddleware from '../lib/bearer-auth-middleware';

const multerUpload = multer({ dest: `${__dirname}/../temp` });
const postRouter = new Router();
const jsonParser = json({ limit: '50mb' });

// TODO: Sarah -- do we need a delete route specifically for images? if so, add pls
postRouter.post('/posts/image', bearerAuthMiddleware, multerUpload.any(), (request, response, next) => {
  if (!request.body.caption || request.files.length > 1 || request.files[0].fieldname !== 'image') {
    return next(new HttpError(400, 'IMAGE ROUTER ERROR, invalid request'));
  } 
  const file = request.files[0];
  const key = `${file.filename}.${file.originalname}`;
  return s3Upload(file.path, key)
    .then((awsUrl) => {
      return new Post({
        title: request.body.caption,
        type: 'photo',
        profile: request.account.profile,
        imageUrl: awsUrl,
        event: request.body.event,
      }).save();
    })
    .then(post => response.json(post))
    .catch(next);
});

postRouter.post('/posts/:event_id', bearerAuthMiddleware, jsonParser, (request, response, next) => {
  return Profile.findOne({ email: request.account.email })
    .then((profile) => {
      return new Post({
        ...request.body,
        event: request.params.event_id,
        profile: profile._id,
      }).save()
        .then((post) => {
          logger.log(logger.INFO, 'Returning 200 and new post');
          return response.json(post);
        });
    })
    .catch(next);
});

postRouter.get('/posts/me', bearerAuthMiddleware, (request, response, next) => {
  return Post.find({ profile: request.account.profile })
    .then((posts) => {
      return response.json(posts);
    })
    .catch(next);
});

postRouter.get('/posts/:event_id', bearerAuthMiddleware, (request, response, next) => {
  return Post.find({ event: request.params.event_id })
    .then((events) => {
      return response.json(events);
    })
    .catch(next);
});

postRouter.put('/posts/likes/:post_id', bearerAuthMiddleware, (request, response, next) => {
  const options = { runValidators: true, new: true };
  return Post.findById(request.params.post_id)
    .then((foundPost) => {
      const updatedLikes = [...foundPost.likes, request.account.username];
      return Post.findByIdAndUpdate(request.params.post_id, { likes: updatedLikes }, options);
    })
    .then((updatedPost) => {
      logger.log(logger.INFO, '200 - Adding like to post');
      return response.json(updatedPost);
    })
    .catch(next);
});

postRouter.put('/posts/:post_id', bearerAuthMiddleware, jsonParser, (request, response, next) => {
  const options = { runValidators: true, new: true };
  return Post.findByIdAndUpdate(request.params.post_id, request.body, options)
    .then((updatedPost) => {
      logger.log(logger.INFO, '200 - Updating post');
      return response.json(updatedPost);
    })
    .catch(next);
});

postRouter.delete('/posts/:post_id', bearerAuthMiddleware, (request, response, next) => {
  return Post.findById(request.params.post_id)
    .then((post) => {
      return post.remove();
    })
    .then(() => {
      logger.log(logger.INFO, '204 - Successful delete');
      return response.sendStatus(204);
    })
    .catch(next);
});


export default postRouter;
