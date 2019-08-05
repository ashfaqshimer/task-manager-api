const express = require('express');
const router = new express.Router();

const Task = require('../models/task');

router.post('/tasks', async (req, res) => {
	const newTask = new Task(req.body);
	try {
		const response = await newTask.save();
		res.status(201).send(response);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.get('/tasks', async (req, res) => {
	try {
		const tasks = await Task.find({});
		res.send(tasks);
	} catch (err) {
		res.status(500).send(err);
	}
});

router.get('/tasks/:id', async (req, res) => {
	const _id = req.params.id;
	try {
		const task = await Task.findById(_id);
		if (!task) {
			return res.status(404).send({ error: 'No tasks matching that id' });
		}
		res.send(task);
	} catch (err) {
		res.status(500).send(err);
	}
});

router.patch('/tasks/:id', async (req, res) => {
	const _id = req.params.id;
	const updates = Object.keys(req.body);
	const allowedUpdates = [ 'description', 'completed' ];
	const isValid = updates.every((update) => allowedUpdates.includes(update));
	if (!isValid) {
		return res.status(400).send({ error: 'Invalid update entry.' });
	}
	try {
		const taskToUpdate = await Task.findById(_id);
		updates.forEach((update) => (taskToUpdate[update] = req.body[update]));

		const task = await taskToUpdate.save();
		if (!taskToUpdate) {
			return res.status(404).send({ error: 'No task matching that id.' });
		}
		res.send(task);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.delete('/tasks/:id', async (req, res) => {
	const _id = req.params.id;

	try {
		const task = await Task.findByIdAndDelete(_id);
		if (!task) {
			return res.status(404).send({ error: 'No task matching that id.' });
		}
		res.send(task);
	} catch (err) {
		res.status(500).send(err);
	}
});

module.exports = router;
