'use strict';

import faker from 'faker';
import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { pCreateProfileMock } from './lib/profile-mock';
import { pCreateEventMock, pRemoveEventMock } from './lib/event-mock';

const apiURL = `http://localhost:${process.env.PORT}`;

describe('EVENT ROUTER', () => {
  beforeAll(startServer);
  afterAll(stopServer);
  afterEach(pRemoveEventMock);

  describe('POST EVENT', () => {
    test('POST /events should give a 200 status code for a successsful post', () => {
      return pCreateProfileMock()
        .then((profileMock) => {
          const eventToPost = {
            title: faker.lorem.words(1),
            description: faker.lorem.words(10),
            location: faker.lorem.words(2),
            profile: profileMock.profile._id.toString(),
          };
          const { token } = profileMock.accountSetMock;

          return superagent.post(`${apiURL}/events`)
            .set('Authorization', `Bearer ${token}`)
            .send(eventToPost)
            .then((response) => {
              expect(response.status).toEqual(200);
              expect(response.body.title).toEqual(eventToPost.title);
              expect(response.body.description).toEqual(eventToPost.description);
              expect(response.body.eventDate).toEqual(eventToPost.eventDate);
              expect(response.body.location).toEqual(eventToPost.location);
              expect(response.body.profile).toEqual(eventToPost.profile);
            });
        });
    });

    test('should return a 400 status if incomplete data is sent', () => {
      return pCreateProfileMock()
        .then((profileMock) => {
          const eventToPost = {
            title: faker.lorem.words(1),
            profile: profileMock.profile._id.toString(),
          };
          const { token } = profileMock.accountSetMock;
          return superagent.post(`${apiURL}/events`)
            .set('Authorization', `Bearer ${token}`)
            .send(eventToPost)
            .then(Promise.reject)
            .catch((err) => {
              expect(err.status).toEqual(400);
            });
        });
    });

    test('should return a 401 status if token is invalid', () => {
      return pCreateProfileMock()
        .then((profileMock) => {
          const eventToPost = {
            title: faker.lorem.words(1),
            profile: profileMock.profile._id.toString(),
          };
          return superagent.post(`${apiURL}/events`)
            .set('Authorization', 'Bearer')
            .send(eventToPost)
            .then(Promise.reject)
            .catch((err) => {
              expect(err.status).toEqual(401);
            });
        });
    });

    test('should return a 404 status if no profile is sent', () => {
      return pCreateProfileMock()
        .then((profileMock) => {
          const eventToPost = {
            title: faker.lorem.words(1),
            description: faker.lorem.words(10),
            location: faker.lorem.words(2),
          };
          const { token } = profileMock.accountSetMock;
          return superagent.post(`${apiURL}/events`)
            .set('Authorization', `Bearer ${token}`)
            .send(eventToPost)
            .then(Promise.reject)
            .catch((err) => {
              expect(err.status).toEqual(404);
            });
        });
    });
  });

  describe('UPDATE EVENT', () => {
    test('PUT /event/:id should return a 200 status code for successful update', () => {
      let eventToUpdate = null;
      return pCreateEventMock()
        .then((mockEvent) => {
          eventToUpdate = mockEvent;
          return superagent.put(`${apiURL}/events/${mockEvent.event._id}`)
            .set('Authorization', `Bearer ${mockEvent.profile.accountSetMock.token}`)
            .send({ title: 'Road Trip' });
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body.title).toEqual('Road Trip');
          expect(response.body.description).toEqual(eventToUpdate.event.description);
        });
    });

    test('should respond with a 404 code if the id is invalid', () => {
      return pCreateEventMock()
        .then((mockEvent) => {
          return superagent.put(`${apiURL}/events/invalidEventId`)
            .set('Authorization', `Bearer ${mockEvent.profile.accountSetMock.token}`)
            .send({ title: 'Road Trip' });
        })
        .then(Promise.reject)
        .catch((err) => {
          expect(err.status).toEqual(404);
        });
    });
  });

  describe('DELETE EVENT', () => {
    test('DELETE /events/:id should delete an event and return a 204 status code', () => {
      return pCreateEventMock()
        .then((mockEvent) => {
          return superagent.delete(`${apiURL}/events/${mockEvent.event._id}`)
            .set('Authorization', `Bearer ${mockEvent.profile.accountSetMock.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(204);
        });
    });
  });
});
