const { spawn } = require('child_process');

const getLink = function (url) {
	if (!url) {
		throw new Error('url not specified');
	}

	return new Promise ((resolve, reject) => {
		const child = spawn('youtube-dl', ['-f', 'mp4', '-g', url]);

		let accStdOut = '';
		child.stdout.on('data', (data) => {
			accStdOut += data.toString();
		});

		child.stderr.on('data', (data) => {
			reject(data);
		});

		child.on('close', (code) => {
			resolve(accStdOut);
		});
	})
};

