'use strict';

import mongoose from 'mongoose';

const profileSchema = mongoose.Schema({
  username: { 
    type: String, 
    required: true,
    unique: true,
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
  },
  bio: { 
    type: String, 
  },
  profileImage: { 
    type: String, 
  },
  account: {
    type: mongoose.Schema.ObjectId,
    required: true,
    unique: true,
  },
  events: [
    {
      type: mongoose.Schema.Types.ObjectId, ref: 'event',
    },
  ],
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId, ref: 'post',
    },
  ],
  friends: {
    type: Array,
  },
}, {
  usePushEach: true,
});

export default mongoose.model('profile', profileSchema);
