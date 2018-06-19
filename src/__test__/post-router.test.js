'use strict';

import superagent from 'superagent';
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

  test('PUT /posts/:post_id should return 200 status and updated post', () => {
    let postToUpdate = null
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
});
