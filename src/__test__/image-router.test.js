'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { pCreatePostImageMock, pRemovePostImageMock } from './lib/image-mock';
// import { pRemovePostImageMock } from './lib/image-mock';
import { pCreateEventMock } from './lib/event-mock';

const apiURL = `http://localhost:${process.env.PORT}`;

describe('IMAGE ROUTER', () => {
  beforeAll(startServer);
  afterAll(stopServer);
  afterEach(pRemovePostImageMock);

  describe('POST to /posts/image', () => {
    test('should return a 200 for a successful POST', () => {
      return pCreateEventMock()
        .then((mockResponse) => {
          const { token } = mockResponse.profile.accountSetMock;
          return superagent.post(`${apiURL}/posts/image`)
            .set('Authorization', `Bearer ${token}`)
            .field('caption', 'this is an image')
            .field('event', mockResponse.event._id.toString())
            .attach('image', `${__dirname}/assets/dog.jpg`)
            .then((response) => {
              expect(response.status).toEqual(200);
              expect(response.body.title).toEqual('this is an image');
              expect(response.body._id).toBeTruthy();
              expect(response.body.imageUrl).toBeTruthy();
            });
        });
    });

    test('should return a 400 status if incomplete data is sent', () => {
      return pCreateEventMock()
        .then((mockResponse) => {
          const { token } = mockResponse.profile.accountSetMock;
          return superagent.post(`${apiURL}/posts/image`)
            .set('Authorization', `Bearer ${token}`)
            .field('event', mockResponse.event._id.toString())
            .attach('image', `${__dirname}/assets/dog.jpg`)
            .then(Promise.reject)
            .catch((err) => {
              expect(err.status).toEqual(400);
            });
        });
    });

    // TODO: Sarah -- do we need a delete route specifically for images? if so, replace below
    test('should return 204 status if image is successfully deleted', () => {
      return pCreatePostImageMock()
        .then((resultMock) => {
          return superagent.del(`${apiURL}/posts/${resultMock.image._id}`)
            .set('Authorization', `Bearer ${resultMock.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(204);
        });
    });
  });
});
