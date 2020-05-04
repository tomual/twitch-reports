var request = require('request');
var fs = require('fs');
var config = require('config');

var games = {};

fs.readdir(config.get('ENV.SAVE_PATH'), readdir_callback);
var date = new Date().toISOString().replace(/(.*)T.*/, "$1").replace(/-/gi, '');

function readdir_callback(error, files) {
	if (error) {
		return console.log(error)
	}
	for (var i = files.length - 1; i >= 0; i--) {
		if (files[i].includes(date)) {
			fs.readFile(config.get('ENV.SAVE_PATH') + files[i], 'utf8', readfile_callback);
		}
	}
}

function readfile_callback(error, data) {
	data = JSON.parse(data);
	for (var i = data.length - 1; i >= 0; i--) {
		if (!games[data[i].name]) {
			games[data[i].name] = [];
		}
		games[data[i].name].push({viewers: data[i].viewers, streams: data[i].streams})
	}
}