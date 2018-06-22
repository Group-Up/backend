'use strict';

import superagent from 'superagent';
import Event from '../model/event';
import { startServer, stopServer } from '../lib/server';
import { pCreateEventMock, pRemoveEventMock } from './lib/event-mock';
import { pCreatePostMock, pRemovePostMock } from './lib/post-mock';

describe('POST ROUTER', () => {
  beforeAll(startServer);
  afterAll(stopServer);
  afterEach(() => {
    pRemovePostMock();
    pRemoveEventMock();
  });

  const apiUrl = `http://localhost:${process.env.PORT}`;

  test('POST /posts/:event_id should return 200 status code and new post', () => {
    const mocks = {};
    return pCreateEventMock()
      .then((eventSetMock) => {
        mocks.event = eventSetMock.event;
        mocks.profile = eventSetMock.profile.profile;
        return superagent.post(`${apiUrl}/posts/${mocks.event._id}`)
          .set('Authorization', `Bearer ${eventSetMock.profile.accountSetMock.token}`)
          .send({
            title: 'Test post',
            description: 'Testing!',
            profile: mocks.profile._id,
            type: 'text',
          });
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.title).toEqual('Test post');
        expect(response.body.description).toEqual('Testing!');
        expect(response.body.profile).toEqual(mocks.profile._id.toString());
        expect(response.body.timestamp).toBeTruthy();
        expect(response.body.isAnnouncement).toBe(false);
        expect(response.body.event).toEqual(mocks.event._id.toString());
      });
  });
  test('POST should return 400 if no auth sent', () => {
    return pCreateEventMock()
      .then((eventSetMock) => {
        return superagent.post(`${apiUrl}/posts/${eventSetMock.event._id}`)
          .send({
            title: 'test',
            description: 'test',
            profile: eventSetMock.profile.profile._id,
            type: 'photo',
          });
      })
      .then(Promise.reject)
      .catch((err) => {
        expect(err.status).toEqual(400);
      });
  });
  test('POST should return 401 if bad auth sent', () => {
    return pCreateEventMock()
      .then((eventSetMock) => {
        return superagent.post(`${apiUrl}/posts/${eventSetMock.event._id}`)
          .set('Authorization', 'Bearer')
          .send({
            title: 'test',
            description: 'test',
            profile: eventSetMock.profile.profile._id,
            type: 'photo',
          });
      })
      .then(Promise.reject)
      .catch((err) => {
        expect(err.status).toEqual(401);
      });
  });
  test('POST should return 400 if bad token sent', () => {
    return pCreateEventMock()
      .then((eventSetMock) => {
        return superagent.post(`${apiUrl}/posts/${eventSetMock.event._id}`)
          .set('Authorization', 'Bearer 4567890')
          .send({
            title: 'test',
            description: 'test',
            profile: eventSetMock.profile.profile._id,
            type: 'photo',
          });
      })
      .then(Promise.reject)
      .catch((err) => {
        expect(err.status).toEqual(400);
      });
  });

  test('GET /posts/:event_id should return 200 status code and all posts on event', () => {
    let mockPost = null;
    return pCreatePostMock()
      .then((postMock) => {
        mockPost = postMock.post;
        return superagent.get(`${apiUrl}/posts/${postMock.event._id}`)
          .set('Authorization', `Bearer ${postMock.token}`);
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].title).toEqual(mockPost.title);
      });
  });

  test('GET /posts/me should return 200 status and all posts for profile', () => {
    let mockPost = null;
    return pCreatePostMock()
      .then((postMock) => {
        mockPost = postMock.post;
        return superagent.get(`${apiUrl}/posts/me`)
          .set('Authorization', `Bearer ${postMock.token}`);
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].title).toEqual(mockPost.title);
      });
  });

  test('PUT /posts/:post_id should return 200 status and updated post', () => {
    let postToUpdate = null;
    return pCreatePostMock()
      .then((postMock) => {
        postToUpdate = postMock.post;
        return superagent.put(`${apiUrl}/posts/${postToUpdate._id}`)
          .set('Authorization', `Bearer ${postMock.token}`)
          .send({ title: 'NEW TITLE' });
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.title).toEqual('NEW TITLE');
        expect(response.body.profile).toEqual(postToUpdate.profile.toString());
      });
  });

  test('DELETE /posts/:post_id should return 204 status code', () => {
    let eventToCompare = null;
    return pCreatePostMock()
      .then((postMock) => {
        eventToCompare = postMock.event;
        return superagent.del(`${apiUrl}/posts/${postMock.post._id}`)
          .set('Authorization', `Bearer ${postMock.token}`);
      })
      .then((response) => {
        expect(response.status).toEqual(204);
        return Event.findById(eventToCompare._id);
      })
      .then((event) => {
        expect(event.posts).toHaveLength(0);
      });
  });

  test('PUT /posts/likes/:post_id should return 200 status and updated post', () => {
    let postToUpdate = null;
    let usernameMock = null;
    return pCreatePostMock()
      .then((postMock) => {
        postToUpdate = postMock.post;
        usernameMock = postMock.profile.username;
        return superagent.put(`${apiUrl}/posts/likes/${postToUpdate._id}`)
          .set('Authorization', `Bearer ${postMock.token}`);
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.likes).toHaveLength(1);
        expect(response.body.likes[0]).toEqual(usernameMock);
      });
  });
});
