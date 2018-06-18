'use strict';

import superagent from 'superagent';
import { Router } from 'express';

require('dotenv').config();

const GOOGLE_OAUTH_URL = 'https://www.googleapis.com/oauth2/v4/token';
const GOOGLE_OPENID_URL = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
const GOOGLE_CONTACTS_URL = 'https://people.googleapis.com/v1/people/me/connections?personFields=names%2CemailAddresses%2Cbirthdays';

const googleRouter = new Router();

googleRouter.get('/oauth/google', (request, response, next) => {
  let accessToken = null;
  let user = {};
  if (!request.query.code) {
    response.redirect(process.env.CLIENT_URL);
  } else {
    return superagent.post(GOOGLE_OAUTH_URL)
      .type('form')
      .send({
        code: request.query.code,
        grant_type: 'authorization_code',
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_SECRET,
        redirect_uri: `${process.env.API_URL}/oauth/google`,
      })
      .then((tokenResponse) => {
        if (!tokenResponse.body.access_token) {
          response.redirect(process.env.CLIENT_URL);
        }
        accessToken = tokenResponse.body.access_token;
        return superagent.get(GOOGLE_OPENID_URL)
          .set('Authorization', `Bearer ${accessToken}`);
      })
      .then((openIdResponse) => {
        // TODO: do something with openIdResponse, add to user object
        console.log(openIdResponse);
        return superagent.get(GOOGLE_CONTACTS_URL)
          .set('Authorization', `Bearer ${accessToken}`);
      })
      .then((contactsResponse) => {
        // let contacts = [];
        // TODO: add contacts to user object
        console.log(contactsResponse.body.connections[0]);
        // TODO: create new user with user object
        response.cookie('GU-OAuth', accessToken);
        response.redirect(process.env.CLIENT_URL);
      })
      .catch((err) => {
        response.redirect(process.env.CLIENT_URL);
        next(err);
      });
  }
  return undefined;
});
