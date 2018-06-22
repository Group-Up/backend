'use strict';

import mongoose from 'mongoose';
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
  // Carl -- prehook is needed to add the event to the creator's events array
  return Profile.findById(this.profile)
    .then((profileFound) => {
      if (profileFound.events.indexOf(this._id) < 0) {
        profileFound.events.push(this._id);
      }
      return profileFound.save();
    })
    .then(() => {
      return Promise.all(this.guests.map(guest => Profile.findOne({ email: guest })
        .then((guestProfile) => {
          if (guestProfile.events.indexOf(this._id) < 0) {
            guestProfile.events.push(this._id);
          }
          return guestProfile.save();
        })));
    })
    .then(() => {
      return done();
    })
    .catch(done);
}

function removeEventHook(document, next) {
  // Carl -- posthook is needed to remove the event._id from the user's events array
  Profile.findById(document.profile)
    .then((profileFound) => {
      profileFound.events = profileFound.events.filter((event) => {
        return event._id.toString() !== document._id.toString();
      });
      return profileFound.save();
    })
    .then(() => {
      return Promise.all(document.guests.map(guest => Profile.findOne({ email: guest })
        .then((guestProfile) => {
          guestProfile.events = guestProfile.events.filter((event) => {
            return event._id.toString() !== document._id.toString();
          });
          return guestProfile.save();
        })));
    })
    .then(() => next())
    .catch(next);
}

eventSchema.pre('save', savePreHook);
eventSchema.post('remove', removeEventHook);

export default mongoose.model('event', eventSchema);
