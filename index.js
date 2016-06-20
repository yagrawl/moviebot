var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

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

        		case "Thanks":
        		case "thank you":
        		case "Thank you":
        			sendMessage(event.sender.id, {text: "You are very welcome!"});
        			break;
        		
        		case "Suggest A Movie":
        		case "Suggest a movie":
        			suggestAMovie(event.sender.id, event.message.text);
        			break;

        		default:
        			sendMessage(event.sender.id, {text: "Sorry, didn't get that!"});
        	
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

function suggestAMovie(recipientId, text){
    var imageUrl3 = "http://cdn1-www.comingsoon.net/assets/uploads/gallery/the-founder/cezgbkauyaa20xx.jpg";
    var movieURL = "http://www.imdb.com/title/tt4276820/";
    message = {
        "attachment": {
        "type": "template",
        	"payload": {
            	"template_type": "generic",
            	"elements": [{
              		"title": "The Founder",
                	"subtitle": "Biography",
                	"image_url": imageUrl3 ,
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