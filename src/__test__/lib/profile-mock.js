'use strict';

import faker from 'faker';
import Profile from '../../model/profile';
import { pCreateAccountMock, pRemoveAccountMock } from './account-mock';

const pCreateProfileMock = () => {
  const resultMock = {};
  return pCreateAccountMock()
    .then((accountSetMock) => {
      resultMock.accountSetMock = accountSetMock;
      console.log(resultMock);
      return new Profile({
        bio: faker.lorem.words(10),
        email: accountSetMock.account.email,
        profileImage: faker.random.image(),
        username: accountSetMock.account.username,
        account: accountSetMock.account._id,
      }).save();
    })
    .then((profile) => {
      resultMock.profile = profile;
      return resultMock;
    });
};

const pRemoveProfileMock = () => {
  return Promise.all([
    Profile.remove({}),
    pRemoveAccountMock(),
  ]);
};

export { pCreateProfileMock, pRemoveProfileMock };
