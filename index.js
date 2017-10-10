const remote = require('remote-file-size');
const prettyBytes = require('pretty-bytes');
const { Composer } = require('micro-bot')
const getLink = require('./get-link.js');
const app = new Composer();

app.command('/start', (ctx) => ctx.reply('Welcome!\n\nEnter the url with the content that you want to get\n\n'))
app.on('message', (ctx) => {
	console.log('запрос', ctx.message.text);
	getLink(ctx.message.text)
		.then(url => {

			if (/\n/.test(url)) {
				url.split(/\n/).forEach(url => {
					remote(url, (err, size) => {
						const replyMsg = `${url} [${prettyBytes(size)}]`;
						console.log({replyMsg});
						ctx.reply(replyMsg);
					})
				});
			}
		})
		.catch(err => {
			console.log({err});
			ctx.reply(err);
		})
})

module.exports = app;
