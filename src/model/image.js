'use strict';

import mongoose from 'mongoose';

const imageSchema = mongoose.Schema({
  caption: {
    type: String,
  },
  url: {
    type: String,
    required: true,
  },
  createdOn: {
    type: Date,
    default: () => new Date(),
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

export default mongoose.model('image', imageSchema);
