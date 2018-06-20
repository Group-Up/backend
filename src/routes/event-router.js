'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import HttpError from 'http-errors';
import logger from '../lib/logger';
import bearerAuthMiddleware from '../lib/bearer-auth-middleware';
import Event from '../model/event';

const jsonParser = bodyParser.json();
const eventRouter = new Router();

eventRouter.post('/events', bearerAuthMiddleware, jsonParser, (request, response, next) => {
  if (!request.body.profile) {
    return next(new HttpError(404, 'EVENT ROUTER ERROR: profile not found'));
  }
  if (!request.body.title || !request.body.description) {
    logger.log(logger.ERROR, 'EVENT_ROUTER - POST - Responding with 400 code - title and desciption are required');
    return next(new HttpError(400, 'Event title and description are required'));
  }
  
  return new Event(request.body).save()
    .then((event) => {
      logger.log(logger.INFO, 'EVENT ROUTER - POST - responding with a 200 status code');
      response.json(event);
    })
    .catch(next);
});

eventRouter.put('/events/:id', bearerAuthMiddleware, jsonParser, (request, response, next) => {
  const options = { runValidators: true, new: true };
  return Event.findByIdAndUpdate(request.params.id, request.body, options)
    .then((updatedEvent) => {
      if (!updatedEvent) {
        return next(new HttpError(404, 'EVENT ROUTER - PUT - event to update not found'));
      }
      logger.log(logger.INFO, 'EVENT ROUTER - PUT - responding with a 200 status code');
      return response.json(updatedEvent);
    })
    .catch(next);
});

eventRouter.delete('/events/:id', bearerAuthMiddleware, (request, response, next) => {
  return Event.findById(request.params.id)
    .then((event) => {
      if (!event) return next(new HttpError(404, 'EVENT ROUTER - DELETE - event not found'));
      return event.remove();
    })
    .then(() => {
      logger.log(logger.INFO, 'EVENT ROUTER - DELETE - responding with a 204 status code');
      return response.sendStatus(204);
    });
});

eventRouter.get('/events/public', bearerAuthMiddleware, (request, response, next) => {
  if (!request.account) return next(new HttpError(400, 'AUTH - invalid request'));
  return Event.find({ isPublic: true })
    .then((events) => {
      logger.log(logger.INFO, '200 - EVENT ROUTER - GET PUBLIC');
      return response.json(events);
    })
    .catch(next);
});

eventRouter.get('/events/:event_id', bearerAuthMiddleware, (request, response, next) => {
  if (!request.account) return next(new HttpError(400, 'AUTH - invalid request'));
  return Event.findById(request.params.event_id)
    .then((foundEvent) => {
      logger.log(logger.INFO, '200 - EVENT ROUTER - GET BY ID');
      return response.json(foundEvent);
    })
    .catch(next);
});


export default eventRouter;
