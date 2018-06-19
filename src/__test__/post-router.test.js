'use strict';

import superagent from 'superagent';
import logger from '../lib/logger';
import { startServer, stopServer } from '../lib/server';
import { pCreateEventMock, pRemoveEventMock } from './lib/event-mock';

describe('POST ROUTER', () => {
  beforeAll(startServer);
  afterAll(stopServer);
  afterEach(() => {
    pRemoveEventMock();
  });

  const apiUrl = `http://localhost:${process.env.PORT}`;

  test('POST /posts/:event_id should return 200 status code and new post', () => {
    const mocks = {};
    return pCreateEventMock()
      .then((eventSetMock) => {
        mocks.event = eventSetMock.event;
        mocks.profile = eventSetMock.profile.profile;
        mocks.token = eventSetMock.profile.accountSetMock.token;
        console.log(mocks);
        return superagent.post(`${apiUrl}/posts/${mocks.event._id}`)
          .set('Authorization', `Bearer ${mocks.token}`)
          .send({
            title: 'Test post',
            description: 'Testing!',
            profile: mocks.profile._id,
          });
      })
      .then((response) => {
        logger.log(logger.INFO, response.body);
        expect(response.status).toEqual(200);
        expect(response.body.title).toEqual('Test post');
        expect(response.body.description).toEqual('Testing!');
        expect(response.body.profile).toEqual(mocks.profile._id.toString());
        expect(response.body.timestamp).toBeTruthy();
        expect(response.body.isAnnouncement).toBe(false);
        expect(response.body.event).toEqual(mocks.event._id.toString());
      });
  });
});
