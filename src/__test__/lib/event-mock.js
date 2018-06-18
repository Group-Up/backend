'use strict';

import faker from 'faker';
import Event from '../../model/event';
import { pCreateProfileMock, pRemoveProfileMock } from './profile-mock';

const pCreateEventMock = () => {
  const resultsMock = {};
  
  return pCreateProfileMock()
    .then((createdProfile) => {
      resultsMock.profile = createdProfile;

      return new Event({
        title: faker.lorem.words(1),
        description: faker.lorem.words(10),
        location: faker.lorem.words(2),
        profile: createdProfile._id,
      }).save();
    })
    .then((newEvent) => {
      resultsMock.event = newEvent;
      return resultsMock;
    });
};

const pRemoveEventMock = () => Promise.all([
  Event.remove({}),
  pRemoveProfileMock(),
]);

export { pCreateEventMock, pRemoveEventMock };
