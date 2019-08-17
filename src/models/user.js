const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Task = require("./task");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
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
      if (value.toLowerCase().includes("password")) {
        throw new Error("Weak password");
      }
    }
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error("Please enter a valid age");
      }
    }
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      }
    }
  ],
  avatar: {
    type: Buffer
  }
}, {
  timestamps: true
});

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "userId"
});

/**
 * To prevent sending the unwanted data like passowrd and tokens we use `toJSON` method on instance
 * `toJSON` is a special JS method which runs just before whenever `JSON.stringify` is called
 * and since `JSON.stringify` is called by `express` everytime while sending data through `res.send()`
 * we can use `.toJSON` to manipulate the data
 *  */

userSchema.methods.toJSON = function() {
  const user = this;
  // convert user form mongoose data object to normal js object---
  const userObj = user.toObject();
  // remove unwanted data before sending---
  delete userObj.password;
  delete userObj.tokens;
  delete userObj.avatar;
  // send the updated data obj---
  return userObj;
};

userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = await jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = [...user.tokens, { token }];

  await user.save();

  return token;
};

/**
 * METHODS are used on instance to add functionality
 * STATICS are used on Model to add functionality
 */

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Unable to login!");
  }

  const isPwdMatch = await bcrypt.compare(password, user.password);
  if (!isPwdMatch) {
    throw new Error("Unable to login!");
  }

  return user;
};

/**
 * to hash password strings `before saving`
 *  */
userSchema.pre("save", async function(next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

/**
 * to remove tasks associated with a `user` just before the user is removed---
 */

userSchema.pre("remove", async function(next) {
  const user = this;
  await Task.deleteMany({ userId: user._id });

  next();
});

const User =  mongoose.model("User", userSchema);

module.exports = User;
