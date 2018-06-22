'use strict';

import mongoose from 'mongoose';
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
  type: {
    type: String,
    required: true,
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
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

function savePreHook(done) {
  // Carl -- prehook is needed to add the post._id to the user's profile.posts array
  // and the corresponding events array of posts.
  return Profile.findById(this.profile)
    .then((profileFound) => {
      if (profileFound.posts.indexOf(this._id) < 0) {
        profileFound.posts.push(this._id);
      }
      return profileFound.save();
    })
    .then(() => {
      return Event.findById(this.event);
    })
    .then((eventFound) => {
      if (eventFound.posts.indexOf(this._id) < 0) {
        eventFound.posts.push(this._id);
      }
      return eventFound.save();
    })
    .then(() => done())
    .catch(done);
}

function removePostHook(document, next) {
  // Carl -- posthook is needed to remove the post._id from the user's posts array
  // and the corresponding events array of posts.
  Profile.findById(document.profile)
    .then((profileFound) => {
      profileFound.posts = profileFound.posts.filter((post) => {
        return post._id.toString() !== document._id.toString();
      });
      return profileFound.save();
    })
    .then(() => {
      return Event.findById(document.event);
    })
    .then((eventFound) => {
      eventFound.posts = eventFound.posts.filter((post) => {
        return post._id.toString() !== document._id.toString();
      });
      return eventFound.save();
    })
    .then(() => next())
    .catch(next);
}

postSchema.pre('save', savePreHook);
postSchema.post('remove', removePostHook);

export default mongoose.model('post', postSchema);
