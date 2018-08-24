'use strict';

import superagent from 'superagent';
import { Router } from 'express';
import Account from '../model/account';
import Profile from '../model/profile';

require('dotenv').config();

const GOOGLE_OAUTH_URL = 'https://www.googleapis.com/oauth2/v4/token';
const GOOGLE_OPENID_URL = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
const GOOGLE_CONTACTS_URL = 'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses';


const googleRouter = new Router();

const getContacts = (user, imageUrl) => {
  const profile = {};
  return superagent.get(GOOGLE_CONTACTS_URL)
    .set('Authorization', `Bearer ${user.accessToken}`)
    .then((contactsResponse) => {
      const contacts = [];
      contactsResponse.body.connections.forEach((contactObject) => {
        const contact = {
          name: contactObject.names && contactObject.names[0].displayName,
          email: contactObject.emailAddresses && contactObject.emailAddresses[0].value,
        };
        contacts.push(contact);
      });
      profile.friends = contacts;
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
        user.accessToken = tokenResponse.body.access_token;
        return superagent.get(GOOGLE_OPENID_URL)
          .set('Authorization', `Bearer ${user.accessToken}`);
      })
      .then((openIdResponse) => {
        user.username = openIdResponse.body.name;
        user.email = openIdResponse.body.email;
        user.isGoogle = true;
        const profileImage = openIdResponse.body.picture;
        return Account.findOne({ email: user.email })
          .then((account) => {
            if (!account) {
              return Account.create(user.username, user.email, 'none')
                .then((newAccount) => {
                  user.id = newAccount._id;
                  return newAccount.pCreateLoginToken();
                })
                .then((token) => {
                  return getContacts(user, profileImage)
                    .then(() => {
                      response
                        .cookie('GU-Token', token, { 
                          secure: false, 
                          maxAge: (7 * 24 * 60 * 60000),
                          domain: process.env.DOMAIN,
                          path: '/', 
                          signed: false, 
                          httpOnly: false, 
                        })
                        .redirect(`${process.env.CLIENT_URL}`);
                    });
                });
            }
            return account.pCreateLoginToken()
              .then((token) => {
                return response
                  .cookie('GU-Token', token, { 
                    secure: false, 
                    maxAge: (7 * 24 * 60 * 60000),
                    domain: process.env.DOMAIN,
                    path: '/', 
                    signed: false, 
                    httpOnly: false, 
                  })
                  .redirect(process.env.CLIENT_URL);
              });
          });
      })
      .catch((err) => {
        response.redirect(process.env.CLIENT_URL);
        next(err);
      });
  }
  return undefined;
});

export default googleRouter;
