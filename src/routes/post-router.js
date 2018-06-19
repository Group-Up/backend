// Posts:
//   PUT /posts/:post_id
//      Input: any changed information on post
//      Output: updated post
//   DELETE /posts/:post_id
//      Input: post id
//      Output: 204 status code
//   Stretch Goal:
//      PUT /posts/likes/:post_id
//        Input: post id
//        Output: updated post

'use strict';

import { Router } from 'express';
import { json } from 'body-parser';
import HttpError from 'http-errors';
import Post from '../model/post';
import Profile from '../model/profile';
import logger from '../lib/logger';
import bearerAuthMiddleware from '../lib/bearer-auth-middleware';

const postRouter = new Router();
const jsonParser = json();

postRouter.post('/posts/:event_id', bearerAuthMiddleware, jsonParser, (request, response, next) => {
  if (!request.account) return next(new HttpError(400, 'AUTH - invalid request'));
  return Profile.findOne({ email: request.account.email })
    .then((profile) => {
      if (!profile) return next(new HttpError(400, 'Profile not found'));
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

postRouter.get('/posts/:event_id', bearerAuthMiddleware, (request, response, next) => {
  if (!request.account) return next(new HttpError(400, 'AUTH - invalid request'));
  return Post.find({ event: request.params.event_id })
    .then((events) => {
      return response.json(events);
    })
    .catch(next);
});

postRouter.put('/posts/:post_id/', bearerAuthMiddleware, jsonParser, (request, response, next) => {
  if (!request.account) return next(new HttpError(400, 'AUTH - Invalid Request'));
  const options = { runValidators: true, new: true };
  return Post.findByIdAndUpdate(request.params.post_id, request.body, options)
    .then((updatedPost) => {
      logger.log(logger.INFO, '200 - Updating post');
      return response.json(updatedPost);
    })
    .catch(next);
});

export default postRouter;
