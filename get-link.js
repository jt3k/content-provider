const { spawn } = require('child_process');

module.exports = function (url) {
	return new Promise ((resolve, reject) => {
		if (!url) {
			return reject(new Error('url not specified'));
		}

		const options = ['-g', url];
		const isYoutube = /^https?:\/\/(www\.youtube\.com|youtu\.be)/.test(url);
		if (isYoutube) {
			options.push('-f', 'mp4');
		}

		const child = spawn('youtube-dl', options);

		let accStdOut = '';
		child.stdout.on('data', (data) => {
			accStdOut += data.toString() + '\n';
		});

		child.stderr.on('data', (data) => {
			reject(data.toString());
		});

		child.on('close', (code) => {
			resolve(accStdOut);
		});
	})
};

