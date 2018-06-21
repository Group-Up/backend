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
        profile: createdProfile.profile._id.toString(),
      }).save();
    })
    .then((newEvent) => {
      resultsMock.event = newEvent;
      return resultsMock;
    });
};

const pCreatePublicEventMock = () => {
  const resultsMock = {};
  return pCreateProfileMock()
    .then((createdProfile) => {
      resultsMock.profile = createdProfile.profile;
      resultsMock.token = createdProfile.accountSetMock.token;
      return new Event({
        title: faker.lorem.words(5),
        description: faker.lorem.words(10),
        isPublic: true,
        location: faker.lorem.words(2),
        profile: createdProfile.profile._id,
      }).save();
    })
    .then((event) => {
      resultsMock.event = event;
      return resultsMock;
    });
};

const pCreateEventWithGuests = () => {
  const resultMock = {};
  return pCreateProfileMock()
    .then((createdProfile) => {
      resultMock.profile = createdProfile.profile;
      resultMock.token = createdProfile.accountSetMock.token;
      resultMock.token = createdProfile.accountSetMock.token;
      return pCreateProfileMock();
    })
    .then((secondProfile) => {
      resultMock.guestEmail = secondProfile.profile.email;
      return new Event({
        title: faker.lorem.words(5),
        description: faker.lorem.words(10),
        location: faker.lorem.words(2),
        profile: resultMock.profile._id,
        guests: [resultMock.guestEmail],
      }).save();
    })
    .then((event) => {
      resultMock.event = event;
      return resultMock;
    });
};

const pRemoveEventMock = () => Promise.all([
  Event.remove({}),
  pRemoveProfileMock(),
]);

export { pCreateEventMock, pRemoveEventMock, pCreatePublicEventMock, pCreateEventWithGuests };
