const { fahrenheitToCelcius, celciusToFahrenheit } = require('../playground/math');

test('Convert from fahrenheit to celcius', () => {
	const temp = fahrenheitToCelcius(32);
	expect(temp).toBe(0);
});

test('Convert from celcius to fahrenheit', () => {
	const temp = celciusToFahrenheit(0);
	expect(temp).toBe(32);
});
