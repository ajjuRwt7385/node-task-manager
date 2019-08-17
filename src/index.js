const express = require("express");

const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

// Start Mongoose---
require("./db/mongoose");

const app = express();
const PORT = process.env.PORT;

// Middleware-- (A function with logic that decides something b/w req and res, like user authentication)
// app.use((req, res, next) => {
//   res.status(503).send({Message: 'The site is under maintanance!'})
// })


app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

// Start server---
app.listen(PORT, () => {
  console.log(`Express server listening to port ${PORT}`);
});
