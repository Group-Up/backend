'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { pCreateImageMock, pRemoveImageMock } from './lib/image-mock';

const apiURL = `http://localhost:${process.env.PORT}`;

describe('IMAGE ROUTER', () => {
  beforeAll(startServer);
  afterAll(stopServer);
  afterEach(pRemoveImageMock);

  describe('POST to /images', () => {
    test('should return a 200 for a successful POST', () => {
      return pCreateImageMock()
        .then((mockResponse) => {
          const { token } = mockResponse.accountMock;

          return superagent.post(`${apiURL}/images`)
            .set('Authorization', `Bearer ${token}`)
            .field('caption', 'this is an image')
            .attach('image', `${__dirname}/assets/dog.jpg`)
            .then((response) => {
              expect(response.status).toEqual(200);
              expect(response.body.caption).toEqual('this is an image');
              expect(response.body._id).toBeTruthy();
              expect(response.body.url).toBeTruthy();
            });
        });
    });

    test('should return a 400 status if incomplete data is sent', () => {
      return pCreateImageMock()
        .then((mockResponse) => {
          const { token } = mockResponse.accountMock;
          return superagent.post(`${apiURL}/images`)
            .set('Authorization', `Bearer ${token}`)
            .field('label', 'image of dog') // label instead of caption will trigger the error
            .attach('image', `${__dirname}/assets/dog.jpg`);
        })
        .then(Promise.reject)
        .catch((err) => {
          expect(err.status).toEqual(400);
        });
    });

    test('should return a 401 status if token is invalid', () => {
      return pCreateImageMock()
        .then(() => {
          return superagent.post(`${apiURL}/images`)
            .set('Authorization', 'Bearer')
            .field('caption', 'image of dog')
            .attach('image', `${__dirname}/assets/dog.jpg`);
        })
        .then(Promise.reject)
        .catch((err) => {
          expect(err.status).toEqual(401);
        });
    });
  });
});
