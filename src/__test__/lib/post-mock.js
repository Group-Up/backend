'use strict';

import faker from 'faker';
import Post from '../../model/post';
import { pCreateEventMock, pRemoveEventMock } from './event-mock';

const pCreatePostMock = () => {
  const resultsMock = {};
  return pCreateEventMock()
    .then((eventMock) => {
      resultsMock.event = eventMock.event;
      resultsMock.profile = eventMock.profile.profile;
      resultsMock.account = eventMock.profile.accountSetMock.account;
      resultsMock.token = eventMock.profile.accountSetMock.token;
      return new Post({
        title: faker.lorem.words(5),
        profile: resultsMock.profile._id,
        event: resultsMock.event._id,
      }).save();
    })
    .then((newPost) => {
      resultsMock.post = newPost;
      return resultsMock;
    });
};

const pRemovePostMock = () => Promise.all([
  Post.remove({}),
  pRemoveEventMock(),
]);

export { pCreatePostMock, pRemovePostMock };
