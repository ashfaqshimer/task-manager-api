const express = require('express');

// Routes
const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');

// Database
require('./db/mongoose');

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
