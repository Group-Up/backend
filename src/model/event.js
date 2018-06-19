'use strict';

import mongoose from 'mongoose';
import HttpError from 'http-errors';
import logger from '../lib/logger';
import Profile from './profile';

const eventSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  eventDate: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  location: {
    type: String,
  },
  createdOn: {
    type: Date,
    default: () => new Date(),
  },
  guests: {
    type: Array,
    default: [],
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'profile',
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'post',
    },
  ],
});

function savePreHook(done) {
  return Profile.findById(this.profile)
    .then((profileFound) => {
      if (!profileFound) throw new HttpError(404, 'Profile not found');
      profileFound.events.push(this._id);
      return profileFound.save();
    })
    .then((profile) => {
      logger.log(logger.INFO, profile);
      logger.log(logger.INFO, this._id);
      return this.guests.forEach(guest => Profile.findOne({ email: guest })
        .then((guestProfile) => {
          guestProfile.events.push(this._id);
          return guestProfile.save();
        }));
    })
    .then(() => done())
    .catch(done);
}

function removePostHook(document, next) {
  Profile.findById(document.profile)
    .then((profileFound) => {
      if (!profileFound) throw new HttpError(400, 'Profile not found');
      profileFound.events = profileFound.events.filter((event) => {
        return event._id.toString() !== document._id.toString();
      });
      profileFound.save();
      document.guests.map(guest => Profile.findOne({ email: guest })
        .then((guestProfile) => {
          guestProfile.events = guestProfile.events.filter((event) => {
            return event._id.toString() !== document._id.toString();
          });
          guestProfile.save();
        }));
    })
    .then(next)
    .catch(next);
}

eventSchema.pre('save', savePreHook);
eventSchema.post('remove', removePostHook);

export default mongoose.model('event', eventSchema);
