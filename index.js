const { Composer } = require('micro-bot')
const bus = require('./bus.js');
const getLink = require('./get-link.js');
const app = new Composer();
const {URL} = require('url');

app.command('/start', (ctx) => ctx.replyWithMarkdown('*=== Welcome!\n\nEnter the url with the content that you want to get\n\n*'))
app.on('message', (ctx) => {
	const userId = ctx.chat.id.toString();
	const isStillWorked = bus.eventNames().includes(userId);
	if (isStillWorked) {
		ctx.replyWithMarkdown('*=== Wait to last task is end.*');
		return;
	}
	ctx.replyWithMarkdown('*=== Ok, started!*');

	const url = ctx.message.text;
	startMiningUrls(userId, url);

	bus.on(userId, msg => {
		const filename = new URL(msg).pathname.split('/').slice(-1);
		ctx.replyWithMarkdown(`[${filename}](${msg})`);
	});

	bus.once(`${userId}-error`, ({error}) => {
		ctx.replyWithMarkdown(`*=== ERROR\n${error}\n=== ERROR*`);
		bus.emit(`${userId}-end-task`);
	});

	bus.once(`${userId}-end-task`, () => {
		bus.removeAllListeners(`${userId}`);
		bus.removeAllListeners(`${userId}-error`);
	});

});


function startMiningUrls(userId, url) {
	getLink(url)
		.then(miningBus => {
			miningBus.on('receive', ({msg}) => {
				bus.emit(userId, msg);
			});

			miningBus.on('error', ({error}) => {
				bus.emit(`${userId}-error`, {error});
			});

			miningBus.on('end', () => {
				bus.emit(`${userId}-end-task`);
			});
		})
		.catch((error) => {
			bus.emit(`${userId}-error`, {error});
		});
}

module.exports = app;
