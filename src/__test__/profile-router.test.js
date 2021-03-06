'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { pCreateAccountMock } from './lib/account-mock';
import { pRemoveProfileMock, pCreateProfileMock } from './lib/profile-mock';
import { pCreateEventMock, pRemoveEventMock } from './lib/event-mock';

const apiURL = `http://localhost:${process.env.PORT}`;

describe('POST /profiles', () => {
  beforeAll(startServer);
  afterAll(stopServer);
  afterEach(() => {
    pRemoveEventMock();
    pRemoveProfileMock();
  });

  test('POST /profiles should return a 200 status code if successful and the newly created profile', () => {
    let accountMock = null;
    return pCreateAccountMock()
      .then((accountSetMock) => {
        accountMock = accountSetMock;
        return superagent.post(`${apiURL}/profiles`)
          .set('Authorization', `Bearer ${accountSetMock.token}`)
          .send({
            bio: 'I like coffee',
          });
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.account).toEqual(accountMock.account._id.toString());
        expect(response.body.username).toEqual(accountMock.account.username);
        expect(response.body.bio).toEqual('I like coffee');
      });
  });

  test('POST /profiles should return a 401 status code if token is invalid', () => {
    return pCreateAccountMock()
      .then(() => {
        return superagent.post(`${apiURL}/profiles`)
          .set('Authorization', 'Bearer')
          .send({
            bio: 'I like coffee',
          });
      })
      .then(Promise.reject)
      .catch((err) => {
        expect(err.status).toEqual(401);
      });
  });

  describe('GET /profiles/:id', () => {
    test('GET /profiles/:id should return a 200 status code and the profile with the requested id', () => {
      return pCreateProfileMock()
        .then((mockprofile) => {
          return superagent.get(`${apiURL}/profiles/${mockprofile.profile._id}`)
            .set('Authorization', `Bearer ${mockprofile.accountSetMock.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(200);
        });
    });

    test('GET /profiles/:id should return 400 status when invalid id is sent', () => {
      return pCreateAccountMock()
        .then((accountSetMock) => {
          return superagent.get(`${apiURL}/profiles/thisIsAnInvalidId`)
            .set('Authorization', `Bearer ${accountSetMock.token}`);
        })
        .then(Promise.reject)
        .catch((err) => {
          expect(err.status).toEqual(404);
        });
    });

    test('GET /profiles/:id should return 401 status if token is invalid', () => {
      return pCreateAccountMock()
        .then(() => {
          return superagent.get(`${apiURL}/profiles/thisIsAnInvalidId`)
            .set('Authorization', 'Bearer');
        })
        .then(Promise.reject)
        .catch((err) => {
          expect(err.status).toEqual(401);
        });
    });
  });

  describe('GET /profiles/me', () => {
    test('should return 200 and profile', () => {
      let profileToCompare = null;
      return pCreateProfileMock()
        .then((mockProfile) => {
          profileToCompare = mockProfile.profile;
          return superagent.get(`${apiURL}/profiles/me`)
            .set('Authorization', `Bearer ${mockProfile.accountSetMock.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body.bio).toEqual(profileToCompare.bio);
        });
    });
  });

  describe('PUT /profile', () => {
    test('should return 200 code and updated profile', () => {
      let profileToUpdate = null;
      return pCreateProfileMock()
        .then((profileMock) => {
          profileToUpdate = profileMock.profile;
          return superagent.put(`${apiURL}/profile`)
            .set('Authorization', `Bearer ${profileMock.accountSetMock.token}`)
            .send({ bio: 'UPDATE BIO' });
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body.bio).toEqual('UPDATE BIO');
          expect(response.body._id).toEqual(profileToUpdate._id.toString());
        });
    });
  });

  describe('GET /profile/events', () => {
    test('should return 200 status and all events on profile', () => {
      let eventToCompare = null;
      return pCreateEventMock()
        .then((resultMock) => {
          eventToCompare = resultMock.event;
          return superagent.get(`${apiURL}/profile/events`)
            .set('Authorization', `Bearer ${resultMock.profile.accountSetMock.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body).toHaveLength(1);
          expect(response.body[0]._id).toEqual(eventToCompare._id.toString());
        });
    });
  });
});
