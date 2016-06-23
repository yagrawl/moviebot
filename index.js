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

var gifR = ["http://66.media.tumblr.com/f16edd3178b2653f4184a97412faf867/tumblr_nmphbmfQ2c1u0idveo1_500.gif",
            "http://67.media.tumblr.com/e0499acfadb78f973f699bb3d70efb4a/tumblr_nmph3ytCli1u0idveo1_500.gif",
            "http://67.media.tumblr.com/326d1b1b6e6860e021582bbed6ebd003/tumblr_nmph26J6xB1u0idveo1_250.gif",
            "http://67.media.tumblr.com/c941afb094d4e729e94b7e6314a8c6d3/tumblr_nmpgr63Ywj1u0idveo1_400.gif",
            "http://67.media.tumblr.com/0ee313c6012dc130672169a04dad4676/tumblr_nmpgotzueU1u0idveo1_500.gif",
            "http://67.media.tumblr.com/1a28a386967c6d93225294ab5f96ded6/tumblr_nmpgfrPSp91u0idveo1_500.gif",
            "http://66.media.tumblr.com/81ca0e29b939460051f62fc14de2a8ac/tumblr_nmpgdpudBw1u0idveo1_500.gif",
            "http://67.media.tumblr.com/90167aa9eb0023f442b2884eafbc9faa/tumblr_nmpg7vHNfv1u0idveo1_500.gif",
            "http://66.media.tumblr.com/e9a84c59cd972f68fa5e409f426a8d9a/tumblr_nmpg2dy7sa1u0idveo1_500.gif",
            "http://67.media.tumblr.com/73f4f67b6c8fbd30d75c0b9bf9e3cd3b/tumblr_nmpfxw6u5O1u0idveo1_500.gif",
            "http://66.media.tumblr.com/c8c081b5f9c58a5dea4dd5514b66004c/tumblr_nmpfvnT9Vf1u0idveo1_500.gif",
            "http://66.media.tumblr.com/tumblr_m85qnebviY1rzturvo1_500.gif",
            "http://66.media.tumblr.com/3855651a8522a145ad4dee7e8b3d329e/tumblr_o8tenyKnNs1u7fdvpo1_500.gif",
            "http://66.media.tumblr.com/33aa2d6859da3a2aca720e633f2f73a5/tumblr_o79uesBauC1u7fdvpo1_500.gif",
            "http://66.media.tumblr.com/e97ea15620672b069ab173b3f98e05da/tumblr_o4ajjzaZZX1rlvekpo1_400.gif",
            "http://66.media.tumblr.com/b8c3704b27062e3a987635e95234daad/tumblr_o00wgkHbdN1usvymao1_400.gif",
            "http://66.media.tumblr.com/57246f1a739b43519c8ff76de5e42fcc/tumblr_n1qhl6TX6n1r2ajr6o1_500.gif",
            "http://66.media.tumblr.com/3a0096f2de0834992a892a5a6643b4a1/tumblr_mqtuk6HM331s9b0sxo1_500.gif",
            "http://67.media.tumblr.com/01155f4c69ce9df3b520068b161adf88/tumblr_o70mci4Vi51tlvvwlo1_540.gif",
            "http://66.media.tumblr.com/8ec4d80d47090e345849ed3099b61a18/tumblr_o79soht03s1tnx46eo2_500.gif"];

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
for(i = 0; i < 20; i++)
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