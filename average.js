var request = require('request');
var fs = require('fs');
var config = require('config');

var games = {};

var date = new Date().toISOString().replace(/(.*)T.*/, "$1").replace(/-/gi, '');
var files = fs.readdirSync(config.get('ENV.SAVE_PATH'));

for (var i = files.length - 1; i >= 0; i--) {
	if (files[i].includes(date)) {
		data = fs.readFileSync(config.get('ENV.SAVE_PATH') + files[i], 'utf8');
		data = JSON.parse(data);
		for (var j = data.length - 1; j >= 0; j--) {
			if (!games[data[j].name]) {
				games[data[j].name] = [];
			}
			games[data[j].name].push({viewers: data[j].viewers, streams: data[j].streams})
		}
	}
}

console.log(games)