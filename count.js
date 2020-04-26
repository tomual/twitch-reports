var request = require('request');
var fs = require('fs');
var config = require('config');

var options = {};
var propertiesObject = { 
	client_id: config.get('ENV.CLIENT_ID'), 
	client_secret: config.get('ENV.CLIENT_SECRET'), 
	grant_type: 'client_credentials', 
};

request.post({url:'https://id.twitch.tv/oauth2/token', qs:propertiesObject}, getGames);

function getGames(error, response, body) {
	options = {
	  url: 'https://api.twitch.tv/helix/games/top?first=100',
	  headers: {
	    'Client-ID': config.get('ENV.CLIENT_ID'),
	    'Authorization': 'Bearer ' + body.access_token
	  }
	};
	request(options, readGames);
}

var games = [];
var report = [];
var index = 0
var results = 0;
var count = 0;
var viewers = 0;
var cursor = '';
var gameId = '';

function readGames(error, response, body) {
    var info = JSON.parse(body);
	if (!error && response.statusCode == 200) {
	    games = info.data;
	    start();
	} else {
		console.log('Failed to get top games list');
	}
}

function start() {
	gameId = games[index].id;
	options.url = 'https://api.twitch.tv/helix/streams?first=100&game_id=' + gameId;
	scrollStreams();
}

function scrollStreams() {
	setTimeout(function () {
		request(options, countStreams);
	}, 3000);
}

function countStreams(error, response, body) {
    var info = JSON.parse(body);
	if (!error && response.statusCode == 200) {
	    results = info.data.length;
	    count += results;
	    for (var i = 0; i < info.data.length; i++) {
	    	viewers += info.data[i].viewer_count;
	    }
	    cursor = info.pagination.cursor;
    	console.log(games[index].name + " - " + "Viewers: " + viewers + " / " + "Streams: " + count);
		if(cursor) {
			options.url = 'https://api.twitch.tv/helix/streams?first=100&game_id=' + gameId + '&after=' + cursor;
			scrollStreams();
		} else {
	    	report.push({
	    		name: games[index].name,
	    		id: games[index].id,
	    		viewers: viewers,
	    		streams: count
	    	});
	    	nextGame();
		}
	} else {
		console.log("Failed with code " + response.statusCode);
	}
}

function nextGame() {
	index++;
	if(games[index]) {
		gameId = games[index].id;
		results = 0;
		count = 0;
		viewers = 0;
		cursor = '';
		options.url = 'https://api.twitch.tv/helix/streams?first=100&game_id=' + gameId;
		scrollStreams();
	} else {
    	console.log(report);
    	var currentTime = new Date();
    	fs.writeFile("public_html/twitch-reports/reports/" + currentTime.toISOString() + ".js", JSON.stringify(report), { flag: 'wx' }, function(err) {
    	    if(err) {
    	        return console.log(err);
    	    }
    	    console.log("Report saved");
    	}); 
	}
}
