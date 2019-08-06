const express = require('express');
const router = new express.Router();
const multer = require('multer');
const sharp = require('sharp');

const upload = multer({
	limits     : {
		fileSize : 1000000
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return cb(new Error('Please upload a valid image'));
		}
		cb(undefined, true);
		// cb(undefined, false);
	}
});

const auth = require('../middleware/auth');
const User = require('../models/user');
const { sendWelcomeEmail, sendLeavingEmail } = require('../emails/account');

router.post('/users', async (req, res) => {
	const newUser = new User(req.body);

	try {
		const user = await newUser.save();
		sendWelcomeEmail(user.email, user.name);
		const token = await user.generateAuthToken();
		res.status(201).send({ user: user.toJSON(), token });
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

router.post('/users/logout', auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token;
		});
		await req.user.save();

		res.send();
	} catch (err) {
		res.status(500).send(err);
	}
});

router.post('/users/logoutAll', auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send();
	} catch (err) {
		res.status(500).send(err);
	}
});

router.get('/users/me', auth, async (req, res) => {
	res.send(req.user);
});

// router.get('/users/:id', async (req, res) => {
// 	const _id = req.params.id;
// 	try {
// 		const user = await User.findById(_id);
// 		if (!user) {
// 			return res.status(404).send({ error: 'No user matching that id' });
// 		}
// 		res.send(user);
// 	} catch (err) {
// 		res.status(500).send(err);
// 	}
// });

router.patch('/users/me', auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = [ 'name', 'email', 'age', 'password' ];
	const isValid = updates.every((update) => allowedUpdates.includes(update));

	if (!isValid) {
		return res.status(400).send({ error: 'Invalid update entry.' });
	}

	try {
		const userToUpdate = req.user;
		updates.forEach((update) => (userToUpdate[update] = req.body[update]));

		const user = await userToUpdate.save();
		// if (!userToUpdate) {
		// 	return res.status(404).send({ error: 'No user with that id.' });
		// }
		res.send(user);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.post(
	'/users/me/avatar',
	auth,
	upload.single('avatar'),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer)
			.resize({ width: 250, height: 250 })
			.png()
			.toBuffer();
		req.user.avatar = buffer;
		await req.user.save();
		res.send();
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);

router.delete('/users/me', auth, async (req, res) => {
	try {
		// const user = await User.findByIdAndDelete(_id);
		// if (!user) {
		// 	return res.status(404).send({ error: 'No user with that id.' });
		// }
		const user = await req.user.remove();
		sendLeavingEmail(user.email, req.user.name);
		res.send(user);
	} catch (err) {
		res.status(500).send(err);
	}
});

router.delete('/users/me/avatar', auth, async (req, res) => {
	req.user.avatar = undefined;
	await req.user.save();
	res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		if (!user) {
			throw new Error('No user matching that id');
		}

		res.set('Content-Type', 'image/png');
		res.send(user.avatar);
	} catch (err) {
		res.status(404).send({ error: err });
	}
});

module.exports = router;
