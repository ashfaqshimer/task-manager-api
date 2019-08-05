const express = require('express');
const router = new express.Router();

const auth = require('../middleware/auth');
const User = require('../models/user');

router.post('/users', async (req, res) => {
	const newUser = new User(req.body);

	try {
		const user = await newUser.save();
		const token = await user.generateAuthToken();
		res.status(201).send({ user, token });
	} catch (err) {
		res.status(400).send(err);
	}
});

router.post('/users/login', async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findByCredentials(email, password);
		const token = await user.generateAuthToken();
		res.send({ user, token });
	} catch (err) {
		res.status(400).send({ error: 'Unable to login.' });
	}
});

router.get('/users/me', auth, async (req, res) => {
	res.send(req.user);
});

router.get('/users/:id', async (req, res) => {
	const _id = req.params.id;
	try {
		const user = await User.findById(_id);
		if (!user) {
			return res.status(404).send({ error: 'No user matching that id' });
		}
		res.send(user);
	} catch (err) {
		res.status(500).send(err);
	}
});

router.patch('/users/:id', async (req, res) => {
	const _id = req.params.id;
	const updates = Object.keys(req.body);
	const allowedUpdates = [ 'name', 'email', 'age', 'password' ];
	const isValid = updates.every((update) => allowedUpdates.includes(update));

	if (!isValid) {
		return res.status(400).send({ error: 'Invalid update entry.' });
	}

	try {
		const userToUpdate = await User.findById(_id);
		updates.forEach((update) => (userToUpdate[update] = req.body[update]));

		const user = await userToUpdate.save();

		if (!userToUpdate) {
			return res.status(404).send({ error: 'No user with that id.' });
		}
		res.send(user);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.delete('/users/:id', async (req, res) => {
	const _id = req.params.id;
	try {
		const user = await User.findByIdAndDelete(_id);
		if (!user) {
			return res.status(404).send({ error: 'No user with that id.' });
		}
		res.send(user);
	} catch (err) {
		res.status(500).send(err);
	}
});

module.exports = router;
