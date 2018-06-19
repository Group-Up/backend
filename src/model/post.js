'use strict';

import mongoose from 'mongoose';
import HttpError from 'http-errors';
import Event from './event';
import Profile from './profile';

const postSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: () => new Date(),
  },
  description: {
    type: String,
  },
  isAnnouncement: {
    type: Boolean,
    default: false,
  },
  likes: {
    type: Array,
    default: [],
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'profile',
  },
  event: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
});

function savePreHook(done) {
  return Profile.findById(this.profile)
    .then((profileFound) => {
      if (!profileFound) throw new HttpError(404, 'Profile not found');
      profileFound.posts.push(this._id);
      return profileFound.save();
    })
    .then(() => {
      return Event.findById(this.event);
    })
    .then((eventFound) => {
      if (!eventFound) throw new HttpError(404, 'Event not found');
      eventFound.posts.push(this._id);
      return eventFound.save();
    })
    .then(() => done())
    .catch(done);
}

function removePostHook(document, next) {
  Profile.findById(document.profile)
    .then((profileFound) => {
      if (!profileFound) throw new HttpError(500, 'Profile not found');
      profileFound.posts = profileFound.posts.filter((post) => {
        return post._id.toString() !== document._id.toString();
      });
      profileFound.save();
      Event.findById(document.event);
    })
    .then((eventFound) => {
      if (!eventFound) throw new HttpError(500, 'Event not found');
      eventFound.posts = eventFound.posts.filter((post) => {
        return post._id.toString() !== document._id.toString();
      });
      eventFound.save();
    })
    .then(next)
    .catch(next);
}

postSchema.pre('save', savePreHook);
postSchema.post('remove', removePostHook);

export default mongoose.model('post', postSchema);
