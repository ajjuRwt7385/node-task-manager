const express = require("express");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const Task = require("../models/task");

// CREATE task---
router.post("/tasks", authMiddleware, async (req, res) => {
  const task = new Task({ ...req.body, userId: req.user._id });
  /**
   * ------------------------------------------------------------------------------------
   * if want to grab the full user details whose `_id` is stored in `userId` field of
   * the task (though irrelevant here as we already have `req.user`)
   * REQUIRES setting user `ref` in the task schema model
   */
  // await task.populate('userId').execPopulate();
  // console.log(task.userId);
  //--------------------------------------------------------------------------------------
  try {
    await task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});

// READ
// all tasks---
router.get("/tasks", authMiddleware, async (req, res) => {
  const completed = req.query.completed === "true";
  const match = {};
  if (req.query.completed) {
    match.completed = completed;
  }

  const sort = {};
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }
  try {
    // const tasks = await Task.find({});
    // const tasks = await Task.find({ userId: req.user._id })
    // res.send(tasks);

    // await req.user.populate('tasks').execPopulate();
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort
        }
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (err) {
    res.status(500).send();
  }
});

// task by id---
router.get("/tasks/:id", authMiddleware, async (req, res) => {
  const _id = req.params.id;
  try {
    // const task = await Task.findById(_id);
    const task = await Task.findOne({ _id, userId: req.user._id });

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (err) {
    res.status(500).send();
  }
});

// UPDATE task---
router.patch("/tasks/:id", authMiddleware, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidUpdate = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).send({ error: "Invalid update!" });
  }

  try {
    const _id = req.params.id;
    // const task = await Task.findById(_id);
    const task = await Task.findOne({ _id, userId: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    updates.forEach(update => (task[update] = req.body[update]));
    await task.save();
    // const task = await Task.findByIdAndUpdate(_id, req.body, {
    //   new: true,
    //   runValidators: true
    // });

    res.send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

// DELETE task---
router.delete("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    // const task = await Task.findByIdAndDelete(req.params.id);
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;
