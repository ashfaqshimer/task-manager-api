const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		to      : email,
		from    : 'shimer.ahamed@gmail.com',
		subject : 'Thanks for joining',
		text    : `Welcome to the app, ${name}. Let us know how you get along with the app.`
	});
};

const sendLeavingEmail = (email, name) => {
	sgMail.send({
		to      : email,
		from    : 'shimer.ahamed@gmail.com',
		subject : 'We are sad to see you go',
		text    : `Thank you for using the app, ${name}. Let us know what we could have done to improve.`
	});
};

module.exports = { sendWelcomeEmail, sendLeavingEmail };
