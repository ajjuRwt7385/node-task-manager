const mongoose = require('mongoose');
const validator = require('validator');

const User = mongoose.model("user", {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Please enter valid email");
        }
      }
    },
    password: {
      type: String,
      trim: true,
      required: true,
      minlength: 7,
      validate(value) {
          if (value.toLowerCase().includes('password')) {
              throw new Error('Weak password')
          }
      }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value<0) {
                throw new Error("Please enter a valid date");
            }
        }
    }
  });

  module.exports = User;