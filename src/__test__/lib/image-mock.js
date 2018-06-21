'use strict';

import faker from 'faker';
import Post from '../../model/post';
import { pCreateEventMock, pRemoveEventMock } from './event-mock';

const pCreatePostImageMock = () => {
  const resultMock = {};
  return pCreateEventMock()
    .then((mockEventResponse) => {
      resultMock.eventMock = mockEventResponse.event;
      resultMock.token = mockEventResponse.profile.accountSetMock.token;
      return new Post({
        title: faker.lorem.words(5),
        imageUrl: faker.random.image(),
        profile: mockEventResponse.profile.profile._id,
        event: resultMock.eventMock._id,
        type: 'photo',
      }).save();
    })
    .then((image) => {
      resultMock.image = image;
      return resultMock;
    });
};

const pRemovePostImageMock = () => Promise.all([Post.remove({}), pRemoveEventMock()]);

export { pCreatePostImageMock, pRemovePostImageMock };
