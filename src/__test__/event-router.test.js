'use strict';

import faker from 'faker';
import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { pCreateProfileMock } from './lib/profile-mock';
import { pCreateEventMock, pRemoveEventMock, pCreatePublicEventMock, pCreateEventWithGuests } from './lib/event-mock';
import Profile from '../model/profile';

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

    test('POST /events with a guest should return 200 and add event to guest profile', () => {
      const resultsMock = {};
      return pCreateProfileMock()
        .then((createdProfile) => {
          resultsMock.profile = createdProfile.profile;
          resultsMock.token = createdProfile.accountSetMock.token;
          return pCreateProfileMock();
        })
        .then((secondProfile) => {
          resultsMock.guestEmail = secondProfile.profile.email;
          return superagent.post(`${apiURL}/events`)
            .set('Authorization', `Bearer ${resultsMock.token}`)
            .send({
              title: faker.lorem.words(5),
              description: faker.lorem.words(10),
              location: faker.lorem.words(2),
              profile: resultsMock.profile._id,
              guests: [resultsMock.guestEmail],
            });
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body.guests).toHaveLength(1);
          resultsMock.eventId = response.body._id;
          return Profile.findOne({ email: resultsMock.guestEmail });
        })
        .then((profile) => {
          expect(profile.events).toHaveLength(1);
          expect(profile.events[0].toString()).toEqual(resultsMock.eventId.toString());
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
          return superagent.del(`${apiURL}/events/${mockEvent.event._id}`)
            .set('Authorization', `Bearer ${mockEvent.profile.accountSetMock.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(204);
        });
    });

    test('DELETE /events/:id should return 204 and remove event from guests profiles', () => {
      let guestToCompare = null;
      return pCreateEventWithGuests()
        .then((mockEvent) => {
          guestToCompare = mockEvent.guestEmail;
          return superagent.del(`${apiURL}/events/${mockEvent.event._id}`)
            .set('Authorization', `Bearer ${mockEvent.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(204);
          return Profile.findOne({ email: guestToCompare });
        })
        .then((profileReturned) => {
          expect(profileReturned.events).toHaveLength(0);
        });
    });
  });

  describe('GET EVENT', () => {
    test('should return 200 status and event', () => {
      let eventCreated = null;
      return pCreateEventMock()
        .then((mockEvent) => {
          eventCreated = mockEvent.event;
          return superagent.get(`${apiURL}/events/${mockEvent.event._id}`)
            .set('Authorization', `Bearer ${mockEvent.profile.accountSetMock.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body.title).toEqual(eventCreated.title);
          expect(response.body._id.toString()).toEqual(eventCreated._id.toString());
          expect(response.body.description).toEqual(eventCreated.description);
          expect(response.body.location).toEqual(eventCreated.location);
          expect(response.body.profile.toString()).toEqual(eventCreated.profile.toString());
        });
    });
  });

  describe('GET PUBLIC EVENTS', () => {
    test('should return 200 status and all public events', () => {
      let publicEvent = null;
      return pCreatePublicEventMock()
        .then((resultMock) => {
          publicEvent = resultMock.event;
          return superagent.get(`${apiURL}/events/public`)
            .set('Authorization', `Bearer ${resultMock.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body).toHaveLength(1);
          expect(response.body[0].title).toEqual(publicEvent.title);
          expect(response.body[0]._id).toEqual(publicEvent._id.toString());
          expect(response.body[0].isPublic).toEqual(true);
        });
    });
  });
});
