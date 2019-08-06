const express = require('express');

// Routes
const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');

// Database
require('./db/mongoose');

const app = express();

// app.use((req, res, next) => {
// 	res.status(503).send('Site is currently under maintenance.');
// });

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

// Server listening port
const port = process.env.PORT;

app.listen(port, () => {
	console.log('Server listening on port', port);
});
