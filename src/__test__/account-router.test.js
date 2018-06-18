'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { pRemoveAccountMock, pCreateAccountMock } from './lib/account-mock';

const apiURL = `http://localhost:${process.env.PORT}`;

describe('ACCOUNT Router', () => {
  beforeAll(startServer);
  afterAll(stopServer);
  afterEach(pRemoveAccountMock);

  test.only('POST should return a 200 status code and a TOKEN', () => {
    return superagent.post(`${apiURL}/signup`)
      .send({
        username: 'testuser',
        email: 'testuser@testuser.com',
        passwordHash: 'testuserpassword',
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.token).toBeTruthy();
      });
  });
  test('POST should return a 400 status code, bad request', () => {
    return superagent.post(`${apiURL}/signup`)
      .send({
        username: '',
        email: '',
        password: '',
      })
      .then((Promise.reject))
      .catch((err) => {
        expect(err.status).toEqual(400);
      });
  });

  test('POST should return a 409 status code, no duplicates', () => {
    return superagent.post(`${apiURL}/signup`)
      .send({
        username: 'testuser',
        email: 'testuser@testuser.com',
        password: 'testuserpassword',
      })
      .then(() => {
        return superagent.post(`${apiURL}/signup`)
          .send({
            username: 'testuser',
            email: 'testuser@testuser.com',
            password: 'testuserpassword',
          })
          .then((Promise.reject))
          .catch((err) => {
            expect(err.status).toEqual(409);
          });
      });
  });
});
