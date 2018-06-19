'use strict';

import mongoose from 'mongoose';

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

export default mongoose.model('event', eventSchema);
