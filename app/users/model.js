const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    cards: [
      {
        type: ObjectId,
        ref: 'card',
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {

    collection: 'users',
  },
);

module.exports = User = mongoose.model('user', UserSchema);
