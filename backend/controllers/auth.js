const { User } = require('../models');
const { APP_KEY } = process.env;

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// loginUsers: Function that allows a user to log in to the application.
const loginUsers = async (req, res) => {
	const { email, password } = req.body;
	let query = {};
	let where = {};

	// find the user by email
	const user = await User.findOne({ where: { email } });

	// set a variable to check if the password is correct
	let validatePassword = false;

	// compare the typed password with the password in the database
	if (user) {
		validatePassword = bcrypt.compareSync(password, user.password);
	}

	// if the email or password isn't correct, return an error
	if (!user || !validatePassword) {
		return res.status(401).json({
			error: true,
			message: 'User or password incorrect',
		});
	}

	// create info to be stored in the token
	const userToken = {
		id: user.id,
		name: user.name,
		type: user.profile,
	};

	//create token, set expiration time to 30 minutes
	const tkn = jwt.sign(
		{ exp: Math.floor(Date.now() / 1000) + 60 * 30, data: userToken },
		`${APP_KEY}`,
		{ algorithm: 'HS512' }
	);

	// return the token and a welcome message
	res.status(200).json({ message: 'Welcome', token: tkn });
};

// logOut: Function that allows a user to log out of the application.
const logOut = async (req, res) => {
	try {
		const tkn = jwt.sign(
			{ exp: Math.floor(Date.now() / 1000) + 1, data: null },
			`expired key`,
			{ algorithm: 'HS512' }
		);
		res
			.cookie('token', tkn, { httpOnly: true })
			.clearCookie('token')
			.json({ message: 'Session closed' });
	} catch (err) {
		res.status(400).json({
			error: true,
			code: 400,
			message: 'Error closing session',
			answer: err,
		});
	}
};

const createUser = async (req, res) => {
	const hash = bcrypt.hashSync(req.body.password, 10);
	try {
		const email = await User.findOne({ where: { email: req.body.email } });
		if (email) {
			return res
				.status(409)
				.json({ message: 'Email already exists or is in use' });
		} else {
			try {
				const user = await User.create({
					name: req.body.name,
					email: req.body.email,
					password: hash,
					profile: req.body.profile,
				});
				res.status(201).json({
					error: false,
					code: 201,
					message: 'Usuario creado',
					answer: user,
				});
			} catch (err) {
				res.status(400).json({
					error: true,
					code: 400,
					message: 'Error creating user',
					answer: err,
				});
			}
		}
	} catch (err) {
		res.status(400).json({
			error: true,
			code: 400,
			message: 'Error creating user',
			answer: err,
		});
	}
};

module.exports = { loginUsers, logOut, createUser };
