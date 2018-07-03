'use strict';

import superagent from 'superagent';
import { Router } from 'express';
import Account from '../model/account';
import Profile from '../model/profile';
import logger from '../lib/logger';

require('dotenv').config();

const GOOGLE_OAUTH_URL = 'https://www.googleapis.com/oauth2/v4/token';
const GOOGLE_OPENID_URL = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
const GOOGLE_CONTACTS_URL = 'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses';

const googleRouter = new Router();

const getContacts = (user, imageUrl) => {
  const profile = {};
  logger.log(logger.INFO, 'GOOGLE ROUTER: retrieving contacts');
  return superagent.get(GOOGLE_CONTACTS_URL)
    .set('Authorization', `Bearer ${user.accessToken}`)
    .then((contactsResponse) => {
      const contacts = [];
      contactsResponse.body.connections.forEach((contactObject) => {
        const contact = {
          name: contactObject.names[0].displayName,
          email: contactObject.emailAddresses[0].value,
        };
        contacts.push(contact);
      });
      profile.friends = contacts;
      logger.log(logger.INFO, 'GOOGLE ROUTER: creating new profile');
      return new Profile({
        username: user.username,
        email: user.email,
        profileImage: imageUrl,
        account: user.id,
        friends: contacts,
        bio: '\n',
      }).save();
    });
};

googleRouter.get('/oauth/google', (request, response, next) => {
  const user = {};
  if (!request.query.code) {
    response.redirect(process.env.CLIENT_URL);
  } else {
    logger.log(logger.INFO, 'GOOGLE ROUTER: received code');
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
        logger.log(logger.INFO, 'GOOGLE ROUTER: received token');
        user.accessToken = tokenResponse.body.access_token;
        return superagent.get(GOOGLE_OPENID_URL)
          .set('Authorization', `Bearer ${user.accessToken}`);
      })
      .then((openIdResponse) => {
        logger.log(logger.INFO, 'GOOGLE ROUTER: received response from openID');
        user.username = openIdResponse.body.name;
        user.email = openIdResponse.body.email;
        user.isGoogle = true;
        const profileImage = openIdResponse.body.picture;
        return Account.findOne({ email: user.email })
          .then((account) => {
            if (!account) {
              logger.log(logger.INFO, 'GOOGLE ROUTER: creating new account');
              return Account.create(user.username, user.email, 'none')
                .then((newAccount) => {
                  user.id = newAccount._id;
                  return newAccount.pCreateLoginToken();
                })
                .then((token) => {
                  return getContacts(user, profileImage)
                    .then(() => {
                      response
                        .cookie('GU-Token', token)
                        .redirect(process.env.CLIENT_URL);
                    });
                });
            }
            logger.log(logger.INFO, 'GOOGLE ROUTER: creating groupup token');
            return account.pCreateLoginToken()
              .then((token) => {
                return response
                  .cookie('GU-Token', token)
                  .redirect(process.env.CLIENT_URL);
              });
          });
      })
      .catch((err) => {
        logger.log(logger.ERROR, 'GOOGLE ROUTER: ERROR');
        response.redirect(process.env.CLIENT_URL);
        next(err);
      });
  }
  return undefined;
});

export default googleRouter;
