const express = require('express');

const auth = require('../middleware/auth');
const router = new express.Router();

const Task = require('../models/task');

router.post('/tasks', auth, async (req, res) => {
	const newTask = new Task({ ...req.body, user: req.user._id });

	try {
		const response = await newTask.save();
		res.status(201).send(response);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.get('/tasks', auth, async (req, res) => {
	const match = {};
	const sort = {};

	if (req.query.completed) {
		match.completed = req.query.completed === 'true';
	}

	if (req.query.sortBy) {
		const parts = req.query.sortBy.split(':');
		sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
	}

	try {
		await req.user
			.populate({
				path    : 'tasks',
				match,
				options : {
					limit : parseInt(req.query.limit),
					skip  : parseInt(req.query.skip),
					sort
				}
			})
			.execPopulate();
		res.send(req.user.tasks);
	} catch (err) {
		res.status(500).send(err);
	}
});

router.get('/tasks/:id', async (req, res) => {
	const _id = req.params.id;
	try {
		const task = await Task.findOne({ _id, user: req.user._id });
		if (!task) {
			return res.status(404).send({ error: 'No tasks matching that id' });
		}
		res.send(task);
	} catch (err) {
		res.status(500).send(err);
	}
});

router.patch('/tasks/:id', auth, async (req, res) => {
	const _id = req.params.id;
	const updates = Object.keys(req.body);
	const allowedUpdates = [ 'description', 'completed' ];
	const isValid = updates.every((update) => allowedUpdates.includes(update));
	if (!isValid) {
		return res.status(400).send({ error: 'Invalid update entry.' });
	}
	try {
		const taskToUpdate = await Task.findOne({ _id, user: req.user._id });
		updates.forEach((update) => (taskToUpdate[update] = req.body[update]));
		if (!taskToUpdate) {
			return res.status(404).send({ error: 'No task matching that id.' });
		}

		const task = await taskToUpdate.save();
		res.send(task);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.delete('/tasks/:id', auth, async (req, res) => {
	const _id = req.params.id;

	try {
		const task = await Task.findOneAndDelete({ _id, user: req.user._id });
		if (!task) {
			return res.status(404).send({ error: 'No task matching that id.' });
		}
		res.send(task);
	} catch (err) {
		res.status(500).send(err);
	}
});

module.exports = router;
