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

postRouter.get('/posts/me', bearerAuthMiddleware, (request, response, next) => {
  if (!request.account) return next(new HttpError(400, 'AUTH - invalid request'));
  return Post.find({ profile: request.account.profile })
    .then((posts) => {
      return response.json(posts);
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

postRouter.put('/posts/likes/:post_id', bearerAuthMiddleware, (request, response, next) => {
  if (!request.account) return next(new HttpError(400, 'AUTH - Invalid Request'));
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
  if (!request.account) return next(new HttpError(400, 'AUTH - Invalid Request'));
  const options = { runValidators: true, new: true };
  return Post.findByIdAndUpdate(request.params.post_id, request.body, options)
    .then((updatedPost) => {
      logger.log(logger.INFO, '200 - Updating post');
      return response.json(updatedPost);
    })
    .catch(next);
});

postRouter.delete('/posts/:post_id', bearerAuthMiddleware, (request, response, next) => {
  if (!request.account) return next(new HttpError(400, 'AUTH - invalid request'));
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
