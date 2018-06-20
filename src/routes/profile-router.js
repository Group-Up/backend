'use strict';

import { Router } from 'express';
import { json } from 'body-parser';
import Profile from '../model/profile';
import logger from '../lib/logger';
import bearerAuthMiddleware from '../lib/bearer-auth-middleware';
import Event from '../model/event';

const profileRouter = new Router();
const jsonParser = json();

profileRouter.post('/profiles', bearerAuthMiddleware, jsonParser, (request, response, next) => {
  return new Profile({
    username: request.account.username,
    bio: request.body.bio,
    email: request.account.email,
    account: request.account._id,
    profileImage: request.body.profileImage,
  }).save()
    .then((profile) => {
      logger.log(logger.INFO, 'Returning a 200 and a new Profile');
      return response.json(profile);
    })
    .catch(next);
});

profileRouter.get('/profile/events', bearerAuthMiddleware, (request, response, next) => {
  const allEvents = [];
  return Profile.findById(request.account.profile)
    .then((profile) => {
      return Promise.all(profile.events.map((eventID) => {
        return Event.findById(eventID)
          .then((eventFound) => {
            allEvents.push(eventFound);
          });
      }))
        .then(() => {
          return response.json(allEvents);
        });
    })
    .catch(next);
});

profileRouter.get('/profiles/me', bearerAuthMiddleware, (request, response, next) => {
  return Profile.findOne({ account: request.account.id })
    .then((profile) => {
      logger.log(logger.INFO, 'Returning a 200 status code and requested Profile');
      return response.json(profile);
    })
    .catch(next);
});

profileRouter.get('/profiles/:id', bearerAuthMiddleware, (request, response, next) => {
  return Profile.findById(request.params.id)
    .then((profile) => {
      logger.log(logger.INFO, 'Returning a 200 status code and requested Profile');
      return response.json(profile);
    })
    .catch(next);
});

profileRouter.put('/profile', bearerAuthMiddleware, jsonParser, (request, response, next) => {
  const options = { runValidators: true, new: true };
  return Profile.findByIdAndUpdate(request.account.profile, request.body, options)
    .then((profile) => {
      logger.log(logger.INFO, 'Returning a 200 status code and requested Profile');
      return response.json(profile);
    })
    .catch(next);
});

export default profileRouter;
