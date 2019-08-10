const app = require('./app');

// Server listening port
const port = process.env.PORT;

app.listen(port, () => {
	console.log('Server listening on port', port);
});
