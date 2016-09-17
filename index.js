//Importing Node Libraries
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var watson = require('watson-developer-cloud');
var fs = require('fs');
var app = express();
var count = 400;
var SimilarID = '550';
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));
var check2;

//Declaring URL variables
var GApi = 'AIzaSyDAUF3d2_c0quSbJAyoQ9h7uMnOJ4pOmFo';
var GImgUrl = 'https://maps.googleapis.com/maps/api/place/photo?maxheight=800&photoreference=';
var GDetUrl = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=';

//Watson Conversation
// var conversation = watson.conversation({
//                         username: '6ea98ed9-8700-46cd-8df3-e8b5250ca21f',
//                         password: 'j2sSDzlX0PeG',
//                         version:      'v1',
//                         version_date: '2016-07-11'
//                     });
// var conversation = watson.conversation({
//                         username: '7a42a2b4-520c-4280-b614-ce47c78bfe21',
//                         password: 'TgnwkfYLZojY',
//                         version:      'v1',
//                         version_date: '2016-07-11'
//                     });

//yagrawl2@illinois.edu
var conversation = watson.conversation({
                        username: '4b8221c7-cec1-478e-a8c5-78ce777642ce',
                        password: 'jDIpzBjK06kH',
                        version:      'v1',
                        version_date: '2016-07-11'
                    });

// var workspace = '6ade0936-fed5-4e13-a6c3-613c1d3a7a22';
// var workspace = '770ab90c-0411-4f39-a125-bd498889f137';
var workspace = 'd700a1ac-c891-4177-ba16-f150e198da41';

//URL declarations for MovieDB API
var APIkey = '?api_key=577e44ee9c54fb29e6c0e28882fc5f53';
var BaseUrl = 'https://api.themoviedb.org/3/movie/';
var PosterUrl = 'http://image.tmdb.org/t/p/original';
var ImgUrl1 = "https://api.projectoxford.ai/vision/v1.0/analyze?details=Celebrities&subscription-key=500a0060ecaf4da89f0a55f37f93d3bc";
var ImgUrl2 = "https://api.projectoxford.ai/vision/v1.0/describe?maxCandidates=1&subscription-key=500a0060ecaf4da89f0a55f37f93d3bc";
var GenreUrl = 'http://api.themoviedb.org/3/genre/';
var IDGenreUrl = '/movies' + APIkey + '&page=';
var CVKey = '500a0060ecaf4da89f0a55f37f93d3bc';
var IMDbUrl = 'www.imdb.com/title/';
var IDGlobal = '550';
var Poster;
var imgPostback = 0;
var imgSearch = 1;
GenreType = 'Christopher Nolan';
var entityOld;
var intentOld;
var Input;


// Server frontpage
app.get('/', function (req, res) {
    res.send('This is TestBot Server');
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
            //var i = Math.floor(Math.random() * (3));
             Input = event.message.text;
             conversation.message({
              input: {"text": event.message.text },
              workspace_id: workspace
            },  function(err, response) {
              if (err) 
                console.log('error:', err);
              else if(response.intents[0].confidence >= 0.25)
              {
                sendMessage(event.sender.id, {text: response.output.text[0] });
                switch(response.intents[0].intent) 
                {
                    case "Greeting":
                        greeting(event.sender.id);
                        break;

                    case "Genre":
                        if(typeof response.entities[0] !== 'undefined' ){
                            if(response.entities[0].entity != 'People')
                            {
                                GenreSearch(event.sender.id, response.entities[0].value );
                                entityOld = response.entities[0].value;
                                intentOld = 1;
                            }
                        }
                        else if(typeof response.entities[0] !== 'undefined')
                        {
                            if(response.entities[0].entity == 'People'){
                                PeopleSearch(event.sender.id, response.entities[0].value );
                            }
                        }
                        break;

                    case "PeopleSearch":
                        if(typeof response.entities[0] !== 'undefined'){
                            PeopleSearch(event.sender.id, response.entities[0].value );
                        }else{
                            Search(event.sender.id, Input);
                        }
                        break;

                    case "Random":
                        randomMovies(event.sender.id, (Math.floor((Math.random() * 30) + 1)).toString());
                        intentOld = 2;
                        break;

                    case "Theatres":
                        inTheatres(event.sender.id,'now_playing');
                        break;

                    case "Help":
                        help(event.sender.id);
                        break;

                    case "ImageSearch":
                        moreImages(event.sender.id, IDGlobal);
                        break;

                    case "Next":
                        if(intentOld == 1)
                        {
                            GenreSearch(event.sender.id, entityOld ); 
                            intentOld = 1;
                        }
                        else if(intentOld == 2) {
                            randomMovies(event.sender.id, (Math.floor((Math.random() * 30) + 1)).toString());
                            intentOld = 2;
                        }
                        break;
                    
                    case "Collection":
                        collections(event.sender.id, Input);
                        break;
                }
            }
            else if(typeof response.entities[0] !== 'undefined')
            {
                Search(event.sender.id, Input);
                if(response.entities[0].entity == 'Emoji')
                {
                    sendMessage(event.sender.id, {text : "Emojis are awesome! 🤖"})
                }
            }
            else if(response.intents[0].intent == "PeopleSearch") {
                Search(event.sender.id, Input);

            } 
            else {
                sendMessage(event.sender.id, {text : "Oops! I didn't quite get that! 😲. Check out the things I can do."});
                help(event.sender.id);
            }             
            });
    }
         else if(event.message && event.message.attachments){
            if(event.message.attachments[0].type == "image" && imgSearch == 1)
            {
                imgRec = event.message.attachments[0].payload.url;
                // sendMessage(event.sender.id, {text: "Searching Image 🔎"});
                getImageInfo(event.sender.id, imgRec, imgPostback);
                
            }
            else if(event.message.attachments[0].type == "location")
            {
                Lat = event.message.attachments[0].payload.coordinates.lat;
                Long = event.message.attachments[0].payload.coordinates.long;
                sendMessage(event.sender.id, {text: 'Searching for theatres near you 🔎'});
                Places(event.sender.id, Lat, Long);

            }
            else {
                sendMessage(event.sender.id, {text: "Umm...cool, I guess!"});
            }
        }
        else if(event.postback && event.postback.payload)
        {
            switch(event.postback.payload)
            {
                case "Hi":
                    sendMessage(event.sender.id, {text: 'Hi! :)'});
                    greeting(event.sender.id);
                    getInfo(event.sender.id);
                    break;

                case "Next":
                case "Random Movie":
                    randomMovies(event.sender.id, (Math.floor((Math.random() * 30) + 1)).toString());
                    getInfo(event.sender.id);
                    break;

                case "Details":
                    getInfoById(event.sender.id, IDPop, "Next");
                    getInfo(event.sender.id);
                    break;

                case "Cast":
                    findCast(event.sender.id, IDGlobal);
                    break;

                case "Help":
                case "help":
                    help(event.sender.id);
                    break;

                case "See Poster":
                    sendImage(event.sender.id, Poster);
                    break;

                case "Who's in this image?":
                    sendMessage(event.sender.id, {text: "Send an image to know who's in it."});
                    imgPostback = 1;
                    imgSearch = 1;
                    break;

                case "Describe Image":
                    sendMessage(event.sender.id, {text: "Send an image to have the bot describe it."});
                    imgPostback = 2;
                    imgSearch = 1;
                    break;

                case "Similar":
                    sendMessage(event.sender.id, {text: "Searching for similar movies 🔎"});
                    SimilarMovies(event.sender.id, SimilarID);
                    break;
            }
        }
    }
    res.sendStatus(200);
});


//Get User Info
function getInfo(recipientId) {
    request({
        url: 'https://graph.facebook.com/v2.6/'+ recipientId +'?fields=first_name,last_name,profile_pic',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'GET',
        json: {
            recipient: {id: recipientId},
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
        Name = response.body.first_name;
        var Last = response.body.last_name;
        var ProfPic = response.body.profile_pic;
        console.log('Name: ', Name);
        console.log('Last Name: ', Last);
        // sendMessage(recipientId, {text: Name + ' ' + Last});
        // sendImage(recipientId, ProfPic);
        
    

    });
};

//Generic function sending messages
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

//Generic function sending images
function sendImage(recipientId, url) {
    message = {
        "attachment": {
            "type": "image",
            "payload": {
                "url": url
                } 
            }
        };
        sendMessage(recipientId, message);
};

//Generic function sending templates
function sendTemplate(recipientId, elements) {
    message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": elements
                    }
                }
            };

    sendMessage(recipientId, message);

};

//Generic function sending buttons
function sendButton(recipientId, title, buttons) {
    message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "button",
                        "text": title,
                        "buttons": buttons
                    }
                }
            };

    sendMessage(recipientId, message);
};

//Greeting function executed when said 'Hi'
function greeting(recipientId){
    var elements = [{
                        "title": "Get good movie recommendations below! 🎬",
                        "subtitle": "And oh, welcome to MovieBot!",
                        "buttons": 
                            [{
                                "type": "postback",
                                "title": "Random Movie",
                                "payload": "Random Movie"
                                }]
                    }];
        sendTemplate(recipientId, elements);

};

//Help Function for all occasions
function help(recipientId){
    var elements =  [{  
                        "title": "Help Desk",
                        "subtitle": "Scroll ➡️ along for some examples. ",
                        "image_url": "http://i.imgur.com/tl0UZzw.png"
                    }];
        elements.push({  
                        "title": "Random Movie Suggestions",
                        "subtitle": "Ask something like 'Random movie', 'movie', 'suggest a movie', anything works! ",
                        "image_url": "http://i.imgur.com/DT8nyRu.png"
                    });
        elements.push({"title": "Genre Based Suggestions",
                        "subtitle": "Just ask 'Horror movie;, 'Action movie', 'Thriller', et cetera (basic genres!)",
                        "image_url": "http://i.imgur.com/A9HPJ53.png"
                    });
         elements.push({"title": "People Based Search",
                        "subtitle": "'movies directed by Christopher Nolan' or 'Movies with Rachel McAdams', etc. ",
                        "image_url": "http://i.imgur.com/Q05B72u.png"
                    });
         elements.push({"title": "Movies Playing Now",
                        "subtitle": "'What's playing?', 'Now playing', or something similar for movies in theatres",
                        "image_url": "http://i.imgur.com/4VAWftb.png"
                    });
                    
     
    sendTemplate(recipientId, elements);

};

//Random movie generator
function randomMovies(recipientId, id){
    request({
        method: 'GET',
        url: BaseUrl + 'popular'  + APIkey  + '&page='+id,
        headers: {
            'Accept': 'application/json'
        }
    }, 
        function (error, response, body) {
            console.log('Status:', response.statusCode);
            var Movies = JSON.parse(body);
            if(response.statusCode != 200)
            {
                sendMessage(recipientId, {text: 'Sorry! 404 😲'});
                help(recipientId);
            }
            else {

                var i = Math.floor((Math.random() * 19) + 1);
                IDPop = Movies.results[i].id.toString();
                IDGlobal = IDPop;
                Poster = PosterUrl + Movies.results[i].poster_path;
                console.log('Movie ID: ', IDPop);
                console.log('Movie: ', Movies.results[i].title);
                var elements = [{
                        "title": Movies.results[i].title,
                        "subtitle": Movies.results[i].overview,
                        "image_url": PosterUrl + Movies.results[i].poster_path, 
                        "buttons": 
                            [{
                                "type": "postback",
                                "title": "Details",
                                "payload": "Details"
                                },{
                                "type": "postback",
                                "title": "See Poster",
                                "payload": "See Poster"
                                },{
                                "type": "postback",
                                "title": "Next",
                                "payload": "Next"
                            }]
                    }];
                sendTemplate(recipientId, elements);    
            }
        });
};

//Current movies
function inTheatres(recipientId, time) {
    request({
        method: 'GET',
        url: BaseUrl + time + APIkey + '&page=1',
        headers: {
            'Accept': 'application/json'
        }
    }, 
        function (error, response, body) {
            console.log('Status:', response.statusCode);
            var Movies = JSON.parse(body);
            if(response.statusCode != 200)
            {
                sendMessage(recipientId, {text: 'Sorry! 404 😲'});
                help(recipientId);
            }
            else {
                var check = [1, 10];
                var start = check[Math.floor(Math.random() * 2)];
                if(start == 10)
                {
                    var end = 18;
                }
                else {var end = 9};
                var elements = [{"title": Movies.results[0].title,
                                    "subtitle": Movies.results[0].overview,
                                    "image_url": PosterUrl + Movies.results[0].poster_path 
                                }];
                 
                for(i = start; i < end; i++)
                {
                    elements.push({"title": Movies.results[i].title,
                                "subtitle": Movies.results[i].overview,
                                "image_url": PosterUrl + Movies.results[i].poster_path 
                            });
                    
                }                
                sendTemplate(recipientId, elements);
                 
            }
        });
 };

//Genre Based Search
function GenreSearch(recipientId, genre){
    switch(genre)
    {
        case "Action":
            genreID = '28';
            break;
        case "Adventure":
            genreID = '12';
            break;
        case "Animation":
            genreID = '16';
            break;
        case "Comedy":
            genreID = '35';
            break;
        case "Crime":
            genreID = '80';
            break;
        case "Documentary":
            genreID = '99';
            break;
        case "Drama":
            genreID = '18';
            break;
        case "Horror":
            genreID = '27';
            break;
        case "Romance":
            genreID = '10749';
            break;
        case "Science Fiction":
            genreID = '878';
            break;
        case "Thriller":
            genreID = '53';
            break;
    }
    request({
        method: 'GET',
        url: GenreUrl + genreID + IDGenreUrl + (Math.floor((Math.random() * 6) + 1)).toString() ,
        headers: {
            'Accept': 'application/json'
        }
    }, 
        function (error, response, body) {
            console.log('Status:', response.statusCode);
            var Movies = JSON.parse(body);
            if(response.statusCode != 200)
            {
                sendMessage(recipientId, {text: 'Sorry! 404 😲'});
                help(recipientId);
            }
            else {

                var i = Math.floor((Math.random() * 19) + 1);
                IDPop = Movies.results[i].id.toString();
                IDGlobal = IDPop;
                Poster = PosterUrl + Movies.results[i].poster_path;
                console.log('Movie ID: ', IDPop);
                console.log('Movie: ', Movies.results[i].title);
                var elements = [{
                        "title": Movies.results[i].title,
                        "subtitle": Movies.results[i].overview,
                        "image_url": PosterUrl + Movies.results[i].poster_path
                }];
                sendTemplate(recipientId, elements);  
            }
            // else {
            //     sendMessage(recipientId, {text: "Sorry! 404 😲. Please try something else."});
            // } if(typeof Movies.results[0] !== 'undefined')

        });

};

//Person based Search
function PeopleSearch(recipientId, Person){

    request({
        method: 'GET',
        url: 'http://api.themoviedb.org/3/search/person' + APIkey + '&query=' + Person ,
        headers: {
            'Accept': 'application/json'
        }
    }, 
        function (error, response, body) {
          var Movies = JSON.parse(body);
          if(response.statusCode != 200)
            {
                sendMessage(recipientId, {text: 'Sorry! 404 😲'});
                help(recipientId);
            }
            else if(typeof Movies.results[0] !== 'undefined' || Movies.total_results != 0) {

                var elements = [{
                        "title": Movies.results[0].name,
                        "subtitle": "Scroll ➡️ for movies",
                        "image_url": PosterUrl + Movies.results[0].profile_path 
                }];
                if(typeof Movies.results[0].known_for[0] !== 'undefined')
                {
                for(i = 0; i < 3; i++)
                    {
                        elements.push({"title": Movies.results[0].known_for[i].title,
                                    "subtitle": Movies.results[0].known_for[i].overview,
                                    "image_url": PosterUrl + Movies.results[0].known_for[i].poster_path 
                                });
                        
                    }
                  }
                  sendTemplate(recipientId, elements);   
            } else {
                sendMessage(recipientId, {text: "Sorry! 404 😲. Please try something else."});
                help(recipientId);
            }
            
        });
};

function collections(recipientId, Input)
{
    sendMessage(recipientId, {text: "I can't do all that just yet! I'm sorry! :(" });
};
//Movie search + Random search
function Search(recipientId, Input){
    request({
        method: 'GET',
        url: 'http://api.themoviedb.org/3/search/movie' + APIkey + '&query=' + Input ,
        headers: {
            'Accept': 'application/json'
        }
    }, 
        function (error, response, body) {
          person = 1, skip=1;
          var Movies = JSON.parse(body);
          if(response.statusCode != 200)
            {
                sendMessage(recipientId, {text: 'Sorry! 404 😲'});
                help(recipientId);
            }
        else {
            if(typeof Movies.results[0] !== 'undefined')
            {
                if(Movies.total_results >= 1 || Movies.results[0].title == Input){
                    j = 0;
                    if(Movies.total_results > 5)
                    {
                        for(i = 0; i < 6; i++)
                        {
                            if(Movies.results[i].vote_average > Movies.results[j].vote_average)
                            {
                                j = i;
                            }
                        }
                    }
                    if(skip)
                    {
                        console.log('Movie: ', Movies.results[j].id); 
                        SimilarID = Movies.results[j].id.toString();
                        IDPop = Movies.results[j].id.toString();
                        IDGlobal = IDPop;
                        Poster = PosterUrl + Movies.results[j].poster_path;
                        console.log('Movie ID: ', IDPop);
                        console.log('Movie: ', Movies.results[j].title);
                        var elements = [{
                                "title": Movies.results[j].title,
                                "subtitle": Movies.results[j].overview,
                                "image_url": PosterUrl + Movies.results[j].poster_path, 
                                "buttons": 
                                    [{
                                        "type": "postback",
                                        "title": "Similar Movies",
                                        "payload": "Similar"
                                    }]
                            }];
                        person = 0;
                        sendTemplate(recipientId, elements); 
                    } 
                }
            }
            if(Movies.total_results != 1 && person == 1) {

                PeopleSearch(recipientId, Input);
            } 
            }
        });
};

//Similar movies
function SimilarMovies(recipientId, ID)
{
    request({
        method: 'GET',
        url: BaseUrl + ID + '/similar' + APIkey ,
        headers: {
            'Accept': 'application/json'
        }
    }, 
        function (error, response, body) {
          var Movies = JSON.parse(body);
          if(response.statusCode != 200)
            {
                sendMessage(recipientId, {text: 'Sorry! 404 😲'});
                help(recipientId);
            }
            else if(typeof Movies.results[0] !== 'undefined') {
                var simNo = Movies.total_results;
                if(simNo >= 10)
                {
                    simNo = 8;
                }
                console.log('Movie: ', Movies.results[0].title);
                var elements = [{
                        "title": Movies.results[0].title,
                        "subtitle": Movies.results[0].overview ,
                        "image_url": PosterUrl + Movies.results[0].poster_path
                }];
                for(i = 1; i < simNo; i++)
                    {
                        elements.push({"title": Movies.results[i].title,
                                        "subtitle": Movies.results[i].overview ,
                                        "image_url": PosterUrl + Movies.results[i].poster_path
                                });
                        
                    }
                sendTemplate(recipientId, elements);    
            } else {
                sendMessage(recipientId, {text: "Sorry! 404 😲. Please try something else."});
            }
            
        });  
};

//Get info on Movie
function getInfoById(recipientId, IDPop, postback) {
    request({
        method: 'GET',
        url: BaseUrl + IDPop + APIkey,
        headers: {
            'Accept': 'application/json'
        }
    }, 
        function (error, response, body) {
            console.log('Status:', response.statusCode);
            var Movies = JSON.parse(body);
            if(response.statusCode != 200)
            {
                sendMessage(recipientId, {text: 'Sorry! 404 😲'});
                help(recipientId);
            }
            else {
                var Title = Movies.title;
                var ID = Movies.id;
                var Tag = Movies.tagline;
                var poster = Movies.poster_path;
                var Imdb = Movies.imdb_id;
                var Lang = Movies.original_language;
                var Rating = Movies.popularity;
                var Year = parseInt(Movies.release_date);
                message = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [{
                                "title": Title,
                                "subtitle": Tag,
                                "buttons": [{
                                    "type": "web_url",
                                    "url": "www.imdb.com/title/" + Imdb,
                                    "title": "IMDB"
                                    }, {
                                    "type": "postback",
                                    "title": "Cast",
                                    "payload": "Cast",
                                },{
                                    "type": "postback",
                                    "title": postback,
                                    "payload": postback,
                                }
                                ]
                            }]
                        }
                    }
                };
                
                sendMessage(recipientId, message);
            }
        });

 };


//Find Cast of the movie
 function findCast(recipientId, ID){

    request({
        method: 'GET',
        url: BaseUrl + ID + '/credits' + APIkey,
        headers: {
            'Accept': 'application/json'
        }}, function (error, response, body) {
                console.log('Status:', response.statusCode);
                var Movies = JSON.parse(body);
                if(response.statusCode != 200)
                {
                    sendMessage(recipientId, {text: 'Sorry! 404 😲'});
                    help(recipientId);
                }
                else if(typeof Movies.cast[0] !== 'undefined') {
                    var castNo = Movies.cast.length;
                    if(castNo >= 10)
                    {
                        castNo = 10
                    }
                    if(typeof Movies.cast[0].profile_path !== 'undefined')
                    {
                        var CastProfile = PosterUrl + Movies.cast[0].profile_path ;
                    }
                    else{

                        var CastProfile = "http://i.imgur.com/uO5oB4q.jpg";
                    }
                    var elements = [{"title": Movies.cast[0].character,
                                    "subtitle": Movies.cast[0].name,
                                    "image_url": CastProfile
                                }];
                 
                    for(i = 1; i < castNo; i++)
                    {
                        if(typeof Movies.cast[i].profile_path !== 'undefined')
                        {
                            var CastProfile = PosterUrl + Movies.cast[i].profile_path ;
                        }
                        else{
                            var CastProfile = "http://i.imgur.com/uO5oB4q.jpg";
                        }
                        elements.push({"title": Movies.cast[i].character,
                                    "subtitle": Movies.cast[i].name,
                                    "image_url": CastProfile 
                                });
                        
                    }
            
                    sendTemplate(recipientId, elements);
                }
                else {
                    sendMessage(recipientId, {text: "Sorry! 404 😲. Please try something else."});
                }
        });
 };

//Microsoft API to describe image
function getImageInfo(recipientId, imgR, purpose){
    imgSearch = 1;
    if(purpose == 1)
    {
        var getUrl = ImgUrl1;
    }
    else if(purpose == 2 || purpose == 0){
        var getUrl = ImgUrl2;
    }
    request({ 
        "url": getUrl,
        "Content-Type": "application/json",
        "method" : 'POST',
        "Host": "api.projectoxford.ai",
        "Content-Length": 44,
        "Ocp-Apim-Subscription-Key": "500a0060ecaf4da89f0a55f37f93d3bc",
        "json" : 
            {"url": imgR}},
        function (error, response, body) {
        if(response.statusCode != 200 )
        {
            sendMessage(event.sender.id, {text: 'Sorry! 404 😲'}); 
            console.log(body);
            console.log(error);   
        }
        else {
            if(purpose == 1)
            {
                var celebs = body.categories[0].detail.celebrities.length;
                for(i = 0; i < celebs; i++)
                {
                    sendMessage(recipientId, {text: body.categories[0].detail.celebrities[i].name});   
                }
                console.log(body.categories[0].detail.celebrities[0].name);
                console.log('This function is being accessed');
            }
            else if(purpose == 2 || purpose == 0)
            {
                if(body.description.captions[0].text == "a close up of two giraffes near a tree")
                {
                    sendMessage(recipientId, {text: ":)"});  
                }
                else {
                    sendMessage(recipientId, {text: "Searching Image 🔎"});
                    sendMessage(recipientId, {text: body.description.captions[0].text});
                }
            }
        }
        imgSearch = 1;   
    });

};

//Temporary Help (Redundant)
function HelpTemp(recipientId, Task, AnotherSuggestion, Keyword) {
    imgSearch = 1;
    message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "button",
                        "text": Task,
                        "buttons": [{
                            "type": "postback",
                            "title": Keyword,
                            "payload": Keyword
                        }]
    
                    }
                }
            };

    sendMessage(recipientId, message);
};

//Secret menu to use Microsoft CV (Redundant)
function hodor(recipientId){
    var elements =  [{  
                        "title": "Secret Menu",
                        "subtitle": "Welcome to the bonus features menu!",
                        "buttons": 
                            [{
                                "type": "postback",
                                "title": "Who's in this image?",
                                "payload": "Who's in this image?"
                            },{
                                "type": "postback",
                                "title": "Describe Image",
                                "payload": "Describe Image",
                            }]
                    }];
        sendTemplate(recipientId, elements);  
};

//Personal Intro (Redundant)
function sendIntro(recipientId){
        var elements =  [{  
                        "title": "Developer Info",
                        "subtitle": "Hey! I'm Yash. Thank you for using moviebot! :)",
                        "buttons": 
                            [{
                                "type": "web_url",
                                "url": "www.yagrawal.com",
                                "title": "🌐 Website"
                            },{
                                "type": "web_url",
                                "url": "m.me/yagrawl",
                                "title": "💬 Messenger"
                            }]
                    }];

        sendTemplate(recipientId, elements);
};

//More Images of the movie
function moreImages(recipientId, ID)
{
    request({
        method: 'GET',
        url: BaseUrl + ID +'/images'+ APIkey,
        headers: {
            'Accept': 'application/json'
        }
    }, 
        function (error, response, body) {
            console.log('Status:', response.statusCode);
            var Movies = JSON.parse(body);
            if(response.statusCode != 200)
            {
                sendMessage(recipientId, {text: 'Sorry! 404 😲'});
                help(recipientId);
            }
            else{
                backdropNo = Movies.backdrops.length;
                if(backdropNo > 10 && backdropNo < 25)
                {
                    backdropNo = 10;
                }
                for(i = 0; i < backdropNo; i++)
                {
                    var imageBack = PosterUrl +  Movies.backdrops[i].file_path; 
                    sendImage(recipientId, imageBack);   
                }
            }
        });
};

//Movie theatres
function Places(recipientId, lat, long){
request({
  method: 'GET', json:true,
  url: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+ lat +','+ long +'&radius=8000&type=movie_theater&key=' + GApi,
  headers: {
    'Accept': 'application/json'
  }}, function (error, response, body) {
    //&& typeof body.results[0].photos == 'undefined'
        if(response.statusCode != 200 )
        {
            sendMessage(recipientId, {text: 'Sorry! 404 😲'});
        }
        else{
            if(typeof body.results[0].photos !== 'undefined')
            {
                var TheatreUrl = GImgUrl + body.results[0].photos[0].photo_reference + '&key=' + GApi ;
            }
            else
            {
                var TheatreUrl = "http://i.imgur.com/17ujpDK.jpg";
            }
            console.log("Lat :", lat);
            console.log("Long :", long);
            var theatres = body.results.length;
            if(theatres >= 10)
            {
                theatres = 10;
            }
            var elements = [{"title": body.results[0].name,
                        "subtitle": body.results[0].vicinity,
                        "image_url": TheatreUrl
                     
                    }];   
            for(i = 1; i < theatres; i++)
            {
                if(typeof body.results[i].photos !== 'undefined')
                {
                    var TheatreUrl = GImgUrl + body.results[i].photos[0].photo_reference + '&key=' + GApi ;
                }
                else
                {
                    var TheatreUrl = "http://i.imgur.com/17ujpDK.jpg";
                }
                elements.push({"title": body.results[i].name,
                            "subtitle": body.results[i].vicinity,
                            "image_url": TheatreUrl
    
                        });
                
            }
            sendTemplate(recipientId, elements);
        }
  });
};


//WATSON API description
//nnd.yash@gmail.com
//yagrawal07@gmail.com
//dennhigs@gmail.com
// var conversation = [ watson.conversation({
//                         username: '6ea98ed9-8700-46cd-8df3-e8b5250ca21f',
//                         password: 'j2sSDzlX0PeG',
//                         version:      'v1',
//                         version_date: '2016-07-11'
//                     }), 
//                     watson.conversation({
//                         username: '549685dc-75a1-476f-b437-2263ca16144b',
//                         password: 'NAkKSwe2CyY3',
//                         version:      'v1',
//                         version_date: '2016-07-11'
//                     }),
//                     watson.conversation({
//                         username: 'e4013c0c-4a62-45ff-a645-1c5735902f28',
//                         password: 'mnyNMX8EgBqe',
//                         version:      'v1',
//                         version_date: '2016-07-11'
//                     }) ];
// var workspace = ['6ade0936-fed5-4e13-a6c3-613c1d3a7a22','baf82b61-a6c7-495b-b945-a6eb817bd87d', '9c82e010-01a2-4e63-b327-c98d9b437bbf'];
