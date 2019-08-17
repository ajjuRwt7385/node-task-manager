const express = require("express");
const multer = require("multer");
const router = express.Router();

const User = require("../models/user");
const { sendWelcomeEmail, sendAccountDeletionEmail } = require('../emails/account'); 

const authMiddlware = require("../middleware/auth");

// CREATE user---
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
});

// LOGIN user---
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (err) {
    res.status(400).send();
  }
});

// LOGOUT user---
router.post("/users/logout", authMiddlware, async (req, res) => {
  try {
    const user = req.user;
    const token = req.token;
    user.tokens = user.tokens.filter(item => item.token !== token);
    await user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

// LOGOUT all---
router.post("/users/logoutAll", authMiddlware, async (req, res) => {
  try {
    const user = req.user;
    user.tokens = [];
    await user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

// READ
// all users---
// router.get("/users", async (req, res) => {
//   try {
//     const users = await User.find({});
//     res.send(users);
//   } catch (err) {
//     res.status(500).send();
//   }
// });

/**
 * Since we don't want a user to see all other users but just his/her own details---
 */
router.get("/users/me", authMiddlware, async (req, res) => {
  /**
   * To get the `tasks` associated with the current user `_id`
   * REQUIRED: create a `virtual` on userSchema to have a relation b/w the tasks and userId
   */
  // await req.user.populate('tasks').execPopulate();
  // console.log(req.user.tasks)
  //--------------------
  res.status(201).send(req.user);
});

/**
 * Since we no longer want a user to `update` OR `delete` another user by id these routes will no longer work and we will have `/me` route instead
 */
// // user by _id---
// router.get("/users/:id", async (req, res) => {
//   const _id = req.params.id;
//   try {
//     const user = await User.findById(_id);
//     if (!user) {
//       return res.status(404).send();
//     }

//     res.send(user);
//   } catch (err) {
//     res.status(500).send();
//   }
// });

// // UPDATE user by id
// router.patch("/users/:id", async (req, res) => {
//   const updates = Object.keys(req.body);
//   const allowedUpdates = ["name", "email", "password", "age"];

//   const isValidUpdate = updates.every(update =>
//     allowedUpdates.includes(update)
//   );

//   if (!isValidUpdate) {
//     return res.status(400).send({ error: "Invalid update!" });
//   }

//   const _id = req.params.id;
//   try {
//     const user = await User.findById(_id);
//     updates.forEach(update => (user[update] = req.body[update]));

//     await user.save();
//     /**
//      * Following doesn't work with middlewares, like what we have for pwd hashing---
//      */
//     // const user = await User.findByIdAndUpdate(_id, req.body, {
//     //   new: true,
//     //   runValidators: true
//     // });

//     if (!user) {
//       res.status(404).send();
//     }
//     res.send(user);
//   } catch (err) {
//     res.status(404).send(err);
//   }
// });
// // DELETE user---
// router.delete("/users/:id", async (req, res) => {
//   try {
//     const user = await User.findByIdAndDelete(req.params.id);
//     if (!user) {
//       res.status(404).send();
//     }
//     res.send(user);
//   } catch (err) {
//     res.status(500).send();
//   }
// });

// UPDATE me---

router.patch("/users/me", authMiddlware, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidUpdate = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).send({ error: "Invalid update!" });
  }

  try {
    updates.forEach(update => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    res.send(req.user);
  } catch (err) {
    res.status(400).send(err);
  }
});

// DELETE me---

router.delete("/users/me", authMiddlware, async (req, res) => {
  try {
    await req.user.remove();
    sendAccountDeletionEmail(req.user.email, req.user.name)
    res.send(req.user);
  } catch (err) {
    res.status(400).send();
  }
});

// UPLOAD profile pic---

const upload = multer({
  /**
   * `dest` is needed only when you want to save the file on file system but that would get wiped out when we deploy it again
   * so instead we are going to save the binary data to the db for which to pass the `req.user` through multer middleware we will have to
   * take out `dest` property
   */
  // dest: 'src/avatars',
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Please upload jpg/jpeg/png/gif images only."));
    }

    cb(undefined, true);
  }
});

router.post(
  "/users/me/avatar",
  authMiddlware,
  upload.single("avatar"),
  async (req, res) => {
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.send();
  },
  (err, req, res, next) => {
    res.status(400).send({ error: err.message });
  }
);

// DELETE profile/avatar image---
router.delete("/users/me/avatar", authMiddlware, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

// Getting the image in jpg format---
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (err) {
    res.status(400).send();
  }
});

module.exports = router;
