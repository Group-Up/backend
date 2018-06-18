'use strict';

import mongoose from 'mongoose';
 
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
    type: String,
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
    // unique: true,
  },
});

export default mongoose.model('post', postSchema);
