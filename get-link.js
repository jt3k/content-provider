const EventEmitter = require('events');
class Emitter extends EventEmitter {}

const { spawn } = require('child_process');
const bus = require('./bus.js');

module.exports = function (url) {
	if (!url) {
		return Promise.reject(new Error('url not specified'));
	}

	const localBus = new Emitter();


	const options = ['-g', url];
	const isYoutube = /^https?:\/\/(www\.youtube\.com|youtu\.be)/.test(url);
	if (isYoutube) {
		options.push('-f', 'mp4'); // prevent output splitted audio and video
	}

	const child = spawn('youtube-dl', options);

	child.stdout.on('data', (data) => {
		localBus.emit('receive', {msg: data.toString().trim()});
	});

	child.stderr.on('data', (data) => {
		localBus.emit('error', {error: data.toString().trim()});
	});

	child.on('close', (code) => {
		localBus.emit('end');
	});
	
	return Promise.resolve(localBus);
};

