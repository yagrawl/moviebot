var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var mId = Math.floor((Math.random() * 1000) + 1);
var APIkey = '?api_key=69c569210010a0db6bf4197759641bb1';
var baseUrl = 'https://api.themoviedb.org/3/movie/';
var Murl = baseUrl + mId + APIkey;
var igur = 'http://img-9gag-fun.9cache.com/photo/';

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is the MovieBot server');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});


var imageR = [  "http://designbuddy.com/wp-content/uploads/2012/12/saul-bass-poster-design.jpg",
                "https://www.movieposter.com/posters/archive/main/4/MPW-2244",
                "http://cdn.mos.cms.futurecdn.net/8e5f9fab8d96968fc28267a4ed4a6707-650-80.jpg",
                "http://pixartimes.com/wp-content/uploads/2015/03/Inside-Out-Official-Poster.jpg"];

var gifR = ["https://media.giphy.com/media/IDJUhbONmynHa/giphy.gif",
            "http://thumbpress.com/wp-content/uploads/2011/11/photoshopped.gif"];

var lc = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
         "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", 
         "1", "2", "3", "4", "5", "6", "7", "8","9","0"];

var uc = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
         "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
         "1", "2", "3", "4", "5", "6", "7", "8","9","0"];


// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
        	switch(event.message.text) {
        	
        		case "Hi":
        		case "hi":
        		case "Hey":
        			sendMessage(event.sender.id, {text: "Hello!"});
        			break;

                case "movie":
                case "Movie":
                    getMovie(event.sender.id);
                    sendMessage(event.sender.id, {text: "Not stuck for now"});
                    break;

        		case "Thanks":
        		case "thank you":
        		case "Thank you":
        			sendMessage(event.sender.id, {text: "You are very welcome!"});
        			break;

                case "exit":
                case "bye":
                case "Exit":
                case "quit":
                    sendMessage(event.sender.id, {text: "Goodbye! Have a nice day!"});
                    break;    
                        		
        		case "Suggest A Movie":
        		case "Suggest a movie":
        			suggestAMovie(event.sender.id, event.message.text);
        			break;

        		case "Suggest Another":
        		case "Suggest another":
        			suggestAnother(event.sender.id, event.message.text);
        			break;

        		case "Suggest some more movies":
        			multipleMovies(event.sender.id, event.message.text);
        			break;

        		case "More Movies":
        			moreMovies(event.sender.id, event.message.text);
        			break;

                case "Random poster":
                case "Random":
                    sendImage(event.sender.id, event.message.text);
                    break;

                case "All gifs":
                    sendGif(event.sender.id, event.message.text);
                    break;
                    
        		default:
        			sendMessage(event.sender.id, {text: "Sorry, don't get what " + "'" + event.message.text  + "'" + " means!"});
        	}
    	}	
    }
    res.sendStatus(200);
});

// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};


function sendImage(recipientId, message) {
    message = {
        "attachment": {
            "type": "image",
            "payload": {
                "url": imageR[Math.floor((Math.random() * 4) - 1)]
                } 
            }
        };
        sendMessage(recipientId, message);
};

function sendGif(recipientId, message) {
for(i = 0; i < 2; i++)
{
    message = {
        "attachment": {
            "type": "image",
            "payload": {
                "url": gifR[i]
                } 
            }
        };
        sendMessage(recipientId, message);
}
};

function getMovie(recipientId) {
    request({
        method: 'GET',
        // json: {
        //     body.original_title: title,
        // },
        url: Murl,
        headers: {
            'Accept': 'application/json'
        }
    }, 
        function (error, response, body) {
            console.log('Status:', response.statusCode);
            console.log('Headers:', JSON.stringify(response.headers));
            console.log('Response:', body);
            sendMessage(recipientId, body.original_title);
        });
        sendMessage(recipientId, {text: "Test"});

 };

function moreMovies(recipientId, text){
	var imageUrl1 = "http://designbuddy.com/wp-content/uploads/2012/12/saul-bass-poster-design.jpg";
	var imageUrl2 = "https://www.movieposter.com/posters/archive/main/4/MPW-2244";
	var imageUrl3 = "http://cdn.mos.cms.futurecdn.net/8e5f9fab8d96968fc28267a4ed4a6707-650-80.jpg";
	var imageUrl4 = "http://pixartimes.com/wp-content/uploads/2015/03/Inside-Out-Official-Poster.jpg";
	var movieUrl1 = "http://www.imdb.com/title/tt0081505/";
	var movieUrl2 = "http://www.imdb.com/title/tt0137523/"; 
	var movieUrl3 = "http://www.imdb.com/title/tt1645170/";
	var movieUrl4 = "http://www.imdb.com/title/tt0758758/";
	message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "The Shining",
                            "subtitle": "Horror",
                            "image_url": imageUrl1 ,
                            "buttons": [{
                                "type": "web_url",
                                "url": movieUrl1,
                                "title": "IMDB"
                                }, {
                                "type": "postback",
                                "title": "More Movies",
                                "payload": "More Movies",
                            }]
                        },
                        {
                            "title": "Fight Club",
                            "subtitle": "Thriller",
                            "image_url": imageUrl2 ,
                            "buttons": [{
                                "type": "web_url",
                                "url": movieUrl2,
                                "title": "IMDB"
                                }, {
                                "type": "postback",
                                "title": "More Movies",
                                "payload": "More Movies",
                            }]
                        },{
                            "title": "The Dictator",
                            "subtitle": "Comedy",
                            "image_url": imageUrl3 ,
                            "buttons": [{
                                "type": "web_url",
                                "url": movieUrl3,
                                "title": "IMDB"
                                }, {
                                "type": "postback",
                                "title": "More Movies",
                                "payload": "More Movies",
                            }]
                        },
                        {
                            "title": "Inside Out",
                            "subtitle": "Animated",
                            "image_url": imageUrl4 ,
                            "buttons": [{
                                "type": "web_url",
                                "url": movieUrl4,
                                "title": "IMDB"
                                }, {
                                "type": "postback",
                                "title": "More Movies",
                                "payload": "More Movies",
                            }]
                        }]
                    }
                }
            };
    
            sendMessage(recipientId, message);

};


function multipleMovies(recipientId, text){
	var imageUrl1 = "http://imgc.allpostersimages.com/images/P-473-488-90/71/7105/HXVV100Z/posters/the-hunt-jagten-movie-poster.jpg";
	var imageUrl2 = "http://cdn3-www.comingsoon.net/assets/uploads/gallery/the-big-short/tbs_1-sht_teaser.jpg";
	var imageUrl3 = "http://www.impawards.com/intl/uk/2013/posters/about_time.jpg";
	var imageUrl4 = "https://upload.wikimedia.org/wikipedia/en/8/8a/Into-the-wild.jpg";
	var movieUrl1 = "http://www.imdb.com/title/tt2106476/";
	var movieUrl2 = "http://www.imdb.com/title/tt1596363/"; 
	var movieUrl3 = "http://www.imdb.com/title/tt2194499/";
	var movieUrl4 = "http://www.imdb.com/title/tt0758758/";
	message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Jagten",
                            "subtitle": "Drama",
                            "image_url": imageUrl1 ,
                            "buttons": [{
                                "type": "web_url",
                                "url": movieUrl1,
                                "title": "IMDB"
                                }, {
                                "type": "postback",
                                "title": "More Movies",
                                "payload": "More Movies",
                            }]
                        },
                        {
                            "title": "The Big Short",
                            "subtitle": "Drama",
                            "image_url": imageUrl2 ,
                            "buttons": [{
                                "type": "web_url",
                                "url": movieUrl2,
                                "title": "IMDB"
                                }, {
                                "type": "postback",
                                "title": "More Movies",
                                "payload": "More Movies",
                            }]
                        },{
                            "title": "About Time",
                            "subtitle": "Romance",
                            "image_url": imageUrl3 ,
                            "buttons": [{
                                "type": "web_url",
                                "url": movieUrl3,
                                "title": "IMDB"
                                }, {
                                "type": "postback",
                                "title": "More Movies",
                                "payload": "More Movies",
                            }]
                        },
                        {
                            "title": "Into The Wild",
                            "subtitle": "Drama",
                            "image_url": imageUrl4 ,
                            "buttons": [{
                                "type": "web_url",
                                "url": movieUrl4,
                                "title": "IMDB"
                                }, {
                                "type": "postback",
                                "title": "More Movies",
                                "payload": "More Movies",
                            }]
                        }]
                    }
                }
            };
    
            sendMessage(recipientId, message);

};

function suggestAMovie(recipientId, text){
    var imageUrl = "http://cdn1-www.comingsoon.net/assets/uploads/gallery/the-founder/cezgbkauyaa20xx.jpg";
    var movieURL = "http://www.imdb.com/title/tt4276820/";
    message = {
        "attachment": {
        "type": "template",
        	"payload": {
            	"template_type": "generic",
            	"elements": [{
              		"title": "The Founder",
                	"subtitle": "Biography",
                	"image_url": imageUrl ,
                	"buttons": [{
                    	"type": "web_url",
                    	"url": movieURL,
                    	"title": "IMDB"
                		},{
                    	"type": "postback",
                    	"title": "Suggest Another",
                    	"payload": "Suggest Another",
                	}]
            	}]
        	}
       	}
    };
            
    sendMessage(recipientId, message);
};

function suggestAnother(recipientId, text){
    var imageUrl = "http://www.impawards.com/2010/posters/inception_ver3.jpg";
    var movieURL = "http://www.imdb.com/title/tt1375666/";
    message = {
        "attachment": {
        "type": "template",
        	"payload": {
            	"template_type": "generic",
            	"elements": [{
              		"title": "Inception",
                	"subtitle": "Thriller",
                	"image_url": imageUrl ,
                	"buttons": [{
                    	"type": "web_url",
                    	"url": movieURL,
                    	"title": "IMDB"
                		},{
                    	"type": "postback",
                    	"title": "Suggest Another",
                    	"payload": "Suggest Another",
                	}]
            	}]
        	}
       	}
    };
            
    sendMessage(recipientId, message);
}; 