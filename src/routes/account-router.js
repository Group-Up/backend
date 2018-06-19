'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import HttpError from 'http-errors';
import logger from '../lib/logger';
import Account from '../model/account';
import basicAuthMiddleware from '../lib/basic-auth-middleware';

const jsonParser = bodyParser.json();

const accountRouter = new Router();

accountRouter.post('/signup', jsonParser, (request, response, next) => {
  return Account.create(request.body.username, request.body.email, request.body.password) // eslint-disable-line
    .then((account) => {
      delete request.body.password;
      logger.log(logger.INFO, 'AUTH - creating TOKEN');
      return account.pCreateLoginToken();
    })
    .then((token) => {
      logger.log(logger.INFO, 'AUTH - returning a 200 code and a token');
      return response
        .cookie('GU-Token', token)
        .send({ token });
    })
    .catch(next);
});

accountRouter.get('/login', basicAuthMiddleware, (request, response, next) => {
  if (!request.account) {
    return next(new HttpError(404, 'AUTH - no resource, now in auth-router'));
  }
  return request.account.pCreateLoginToken()
    .then((token) => {
      logger.log(logger.INFO, 'LOGIN - AuthRouter responding with a 200 status and a Token');
      return response
        .cookie('GU-Token', token)
        .send({ token });
    })
    .catch(next);
});

export default accountRouter;
