const express = require("express");

const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

// Start Mongoose---
require("./db/mongoose");

const app = express();
const PORT = process.env.PORT || 7385;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

// Start server---
app.listen(PORT, () => {
  console.log(`Express server listening to port ${PORT}`);
});
