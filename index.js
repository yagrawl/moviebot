// Moviebot v.2.0
// Author : Yash Agrawal (https://yagrawal.com)
// The following is a script based code for Moviebot accessible at https://m.me/moviebots
// It uses Google's API.ai for NLP and TMDb API for movie data. Also leverages microsoft's CV API
// (for users that tried to break the bot using images) and finally, Google's places API to suggest
// nearby theatres

// Hosted on heroku (email : yagrawl2@gmail.com)
// All API keys stored in config vars on Heroku for protection purposes.
// If you want to use this code for your own bot, get API keys from TMDB, API.ai, Google places and Microsoft CV

// All the functions are working. As of 10/07/2017

// Global variables for access through all functions
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

// API.ai email : moviebot3
const apiaiApp = require('apiai')(process.env.APIAI_API_KEY);

// The MovieDB API variables
const APIkey = '?api_key=' + process.env.TMDB_API_KEY;
const BaseUrl = 'https://api.themoviedb.org/3/movie/';
const PosterUrl = 'https://image.tmdb.org/t/p/w500';
const IMDbUrl = 'www.imdb.com/title/';

// Computer Vision API variables
const CV_key = process.env.CV_KEY;
const ImgUrl1 = "https://api.projectoxford.ai/vision/v1.0/analyze?details=Celebrities&subscription-key=" + CV_key;
const ImgUrl2 = "https://api.projectoxford.ai/vision/v1.0/describe?maxCandidates=1&subscription-key=" + CV_key;

// Google Places API variables
const GApi = process.env.G_API;
const GImgUrl = 'https://maps.googleapis.com/maps/api/place/photo?maxheight=800&photoreference=';
const GDetUrl = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=';

let imgPostback = 0;
let imgSearch = 1;
var Data = {};
var nextTag = 2;

// Code arrangement
// 01 - Facebook post method.
// 02 - Switches + API.AI
// 03 - getInfo
// 04 - sendFunctions
// 05 - greeting
// 06 - Help
// 07 - Genre Search
// 08 - People Search
// 09 - Random Movies
// 10 - In Theatre
// 11 - Similar Movies
// 12 - Info by ID
// 13 - Search
// 14 - Find Cast
// 15 - Image Info
// 16 - Places

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

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

// Main dispatcher fucntion. When it receives an event call from the user
// it sends the message as a query to a customed trained API.ai NLP model
// and based on the received intent calls the necessary functions.
// Also handles postbacks and media
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            var apiai = apiaiApp.textRequest(event.message.text, {
                sessionId: 'moviebot'
            });

            apiai.on('response', (response) => {
                console.log(response);
                let sender = event.sender.id;
                let intent = response.result.metadata.intentName;
                if(response.result.action.includes("smalltalk")){
                    console.log('check :' + response.result.fulfillment.speech);
                    sendMessage(sender, {text: response.result.fulfillment.speech});

                }

                else {
                    switch(intent)
                    {

                        case "Greeting":
                            greeting(sender);
                            break;

                        case "Genre":
                            var genre = response.result.parameters.Genre;
                            nextTag = 1;
                            currentGenre = genre;
                            GenreSearch(sender, genre);
                            break;

                        case "PeopleSearch":
                            var person = response.result.parameters.People;
                            PeopleSearch(sender, person);
                            break;

                        case "Random":
                            nextTag = 2;
                            randomMovies(sender);
                            break;

                        case "Theatres":
                            inTheatres(sender,'now_playing');
                            break;

                        case "Help":
                            help(sender);
                            break;

                        case "Next":
                            if(nextTag === 1)
                            {
                                GenreSearch(sender, currentGenre);
                                nextTag = 1;
                            }
                            else {
                                randomMovies(sender);
                                nextTag = 2;
                            }
                            break;

                        case "Profanity":
                            sendMessage(sender, {text: ':/'});
                            break;

                        case 'DoNothing':
                            break;

                        default:
                            if(intent == 'Default Fallback Intent'){
                                Search(sender, event.message.text);
                            }
                            break;

                }
            }


        });

                apiai.on('error', (error) => {
                    console.log(error);
                });

                apiai.end();

        }
        else if(event.message && event.message.attachments){
            let sender = event.sender.id;
            if(event.message.attachments[0].type == "image" && imgSearch == 1)
            {
                imgRec = event.message.attachments[0].payload.url;
                getImageInfo(sender, imgRec, imgPostback);

            }
            else if(event.message.attachments[0].type == "location")
            {
                Lat = event.message.attachments[0].payload.coordinates.lat;
                Long = event.message.attachments[0].payload.coordinates.long;
                sendMessage(sender, {text: 'Searching for theatres near you 🔎'});
                Places(sender, Lat, Long);

            }
            else {
                sendMessage(sender, {text: "Umm...cool, I guess!"});
            }
        }
        else if(event.postback && event.postback.payload)
        {
            var sender = event.sender.id;
            switch(event.postback.payload)
            {
                case "Hi":
                    sendMessage(sender, {text: 'Hi! :)'});
                    greeting(sender);
                    getInfo(sender);
                    break;

                case "Next":
                    if(nextTag === 1)
                    {
                        GenreSearch(sender, currentGenre);
                        nextTag = 1;
                    }
                    else {
                        randomMovies(sender);
                        nextTag = 2;
                    }
                    break;

                case "Random Movie":
                    nextTag = 2
                    randomMovies(sender);
                    getInfo(sender);
                    break;

                case "Details":
                    getInfoById(sender, IDPop, "Next");
                    getInfo(sender);
                    break;

                case "Cast":
                    findCast(sender, IDGlobal);
                    break;

                case "Help":
                case "help":
                    help(sender);
                    break;

                case "See Poster":
                    sendImage(sender, Poster);
                    break;

                case "Who's in this image?":
                    sendMessage(sender, {text: "Send an image to know who's in it."});
                    imgPostback = 1;
                    imgSearch = 1;
                    break;

                case "Describe Image":
                    sendMessage(sender, {text: "Send an image to have the bot describe it."});
                    imgPostback = 2;
                    imgSearch = 1;
                    break;

                case "Similar":
                    sendMessage(sender, {text: "Searching for similar movies 🔎"});
                    SimilarMovies(sender, SimilarID);
                    break;
            }
        }
    }
    res.sendStatus(200);
});

// Get Info of the user like name, location,
// profile picture to create a database (future implementation)
function getInfo(sender) {
    request({
        url: 'https://graph.facebook.com/v2.6/'+ sender +'?fields=first_name,last_name,profile_pic,locale,timezone,gender',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'GET',
        json: {
            recipient: {id: sender},
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
        Data = response.body;
        console.log(Data);

    });
};

// generic function sending messages
function sendMessage(sender, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: sender},
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
function sendImage(sender, url) {
    message = {
        "attachment": {
            "type": "image",
            "payload": {
                "url": url
                }
            }
        };
        sendMessage(sender, message);
};

//Generic function sending templates
function sendTemplate(sender, elements) {
    message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": elements
                    }
                }
            };

    sendMessage(sender, message);

};

//Generic function sending buttons
function sendButton(sender, title, buttons) {
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

    sendMessage(sender, message);
};

//Greeting function executed when said 'Hi'
function greeting(sender){
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
        sendTemplate(sender, elements);

};

//Help Function for all occasions
function help(sender){
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


    sendTemplate(sender, elements);

};

// Genre Based Search
// After the genre is recognised by API.ai customed trained entity,
// filter according to TMDb specifications and call sendTemplate
// Also change globalvar nextTag to make sure that the next postback
// calls a movie with the same genre (!TODO: look for a better implementation
// than polluting global scope)
function GenreSearch(sender, genre){

    var GenreUrl = 'http://api.themoviedb.org/3/genre/';
    var IDGenreUrl = '/movies' + APIkey + '&page=';

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
            let Movies = JSON.parse(body);
            if(response.statusCode != 200)
            {
                sendMessage(sender, {text: 'Sorry! 404 😲'});
                help(sender);
            }
            else {

                let i = Math.floor((Math.random() * 19) + 1);
                IDPop = Movies.results[i].id.toString();
                IDGlobal = IDPop;
                Poster = PosterUrl + Movies.results[i].poster_path;
                console.log('Movie ID: ', IDPop);
                console.log('Movie: ', Movies.results[i].title);
                let elements = [{
                        "title": Movies.results[i].title,
                        "subtitle": Movies.results[i].overview,
                        "image_url": PosterUrl + Movies.results[i].poster_path,
                        "buttons":
                            [{
                                "type": "postback",
                                "title": "Next",
                                "payload": "Next"
                            }]
                }];
                sendTemplate(sender, elements);
            }

        });

};

// Person based Search
// Searches for movies by a particular person as recognised by API.ai's
// people entity. Implemented because a lot of users searched for Quentin Tarantino
// TODO : Add additional checks. Sensitive area
function PeopleSearch(sender, Person){
    request({
        method: 'GET',
        url: 'http://api.themoviedb.org/3/search/person' + APIkey + '&query=' + Person + '&page=1' ,
        headers: {
            'Accept': 'application/json'
        }
    },
        function (error, response, body) {
          let Movies = JSON.parse(body);
          if(response.statusCode != 200)
            {
                sendMessage(sender, {text: 'Sorry! 404 😲'});
                help(sender);
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
                  sendTemplate(sender, elements);
            } else {
                sendMessage(sender, {text: "Sorry! 404 😲. Please try something else."});
                help(sender);
            }

        });
};

// Random movie generator.
// Call the API to return the most popular movies and
// randomly select one. Also keep track of the movieid
// to receive additional details if asked by the user
function randomMovies(sender){

    let id = (Math.floor((Math.random() * 30) + 1)).toString();
    request({
        method: 'GET',
        url: BaseUrl + 'popular'  + APIkey  + '&page='+id,
        headers: {
            'Accept': 'application/json'
        }
    },
        function (error, response, body) {
            console.log('Status:', response.statusCode);
            let Movies = JSON.parse(body);
            if(response.statusCode != 200)
            {
                sendMessage(sender, {text: 'Sorry! 404 😲'});
                help(sender);
            }
            else {

                let i = Math.floor((Math.random() * 19) + 1);
                IDPop = Movies.results[i].id.toString();
                IDGlobal = IDPop;
                Poster = PosterUrl + Movies.results[i].poster_path;
                console.log('Movie ID: ', IDPop);
                console.log('Movie: ', Movies.results[i].title);
                let elements = [{
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
                sendTemplate(sender, elements);
            }
        });
};

// Current movies
// Return a list of current movies in the theatres
function inTheatres(sender, time) {
    request({
        method: 'GET',
        url: BaseUrl + time + APIkey + '&page=1',
        headers: {
            'Accept': 'application/json'
        }
    },
        function (error, response, body) {
            console.log('Status:', response.statusCode);
            let Movies = JSON.parse(body);
            if(response.statusCode != 200)
            {
                sendMessage(sender, {text: 'Sorry! 404 😲'});
                help(sender);
            }
            else {
                let check = [1, 10];
                let start = check[Math.floor(Math.random() * 2)];
                if(start == 10)
                {
                    var end = 18;
                }
                else
                {
                    var end = 9
                };
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
                sendTemplate(sender, elements);

            }
        });
 };

 //Similar movies
function SimilarMovies(sender, ID)
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
                sendMessage(sender, {text: 'Sorry! 404 😲'});
                help(sender);
            }
            else if(typeof Movies.results[0] !== 'undefined') {
                let simNo = Movies.total_results;
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
                sendTemplate(sender, elements);
            } else {
                sendMessage(sender, {text: "Sorry! 404 😲. Please try something else."});
            }

        });
};

//Get info on Movie
function getInfoById(sender, IDPop, postback) {
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
                sendMessage(sender, {text: 'Sorry! 404 😲'});
                help(sender);
            }
            else {
                let Title = Movies.title;
                let ID = Movies.id;
                let Tag = Movies.tagline;
                let poster = Movies.poster_path;
                let Imdb = Movies.imdb_id;
                let Lang = Movies.original_language;
                let Rating = Movies.popularity;
                let Year = parseInt(Movies.release_date);
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

                sendMessage(sender, message);
            }
        });

 };

//Movie search + Random search
function Search(sender, Input){
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
                sendMessage(sender, {text: 'Sorry! 404 😲'});
                help(sender);
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
                        sendTemplate(sender, elements);
                    }
                }
            }
            if(person == 1) {
                sendMessage(sender, {text: "Couldn't quite get that. Try something else? Or ask for Help. :)"});
                PeopleSearch(sender, Input);
            }
            }
        });
};

//Find Cast of the movie
 function findCast(sender, ID){

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
                    sendMessage(sender, {text: 'Sorry! 404 😲'});
                    help(sender);
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

                    sendTemplate(sender, elements);
                }
                else {
                    sendMessage(sender, {text: "Sorry! 404 😲. Please try something else."});
                }
        });
 };


//Microsoft API to describe image
function getImageInfo(sender, imgR, purpose){
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
            sendMessage(sender, {text: 'Sorry! 404 😲'});
            console.log(body);
            console.log(error);
        }
        else {
            if(purpose == 1)
            {
                var celebs = body.categories[0].detail.celebrities.length;
                for(i = 0; i < celebs; i++)
                {
                    sendMessage(sender, {text: body.categories[0].detail.celebrities[i].name});
                }
                console.log(body.categories[0].detail.celebrities[0].name);
                console.log('This function is being accessed');
            }
            else if(purpose == 2 || purpose == 0)
            {
                if(body.description.captions[0].text == "a close up of two giraffes near a tree")
                {
                    sendMessage(sender, {text: ":)"});
                }
                else {
                    sendMessage(sender, {text: "Searching Image 🔎"});
                    sendMessage(sender, {text: body.description.captions[0].text});
                }
            }
        }
        imgSearch = 1;
    });

};

//Movie theatres
function Places(sender, lat, long){

    request({
      method: 'GET', json:true,
      url: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+ lat +','+ long +'&radius=8000&type=movie_theater&key=' + GApi,
      headers: {
        'Accept': 'application/json'
      }}, function (error, response, body) {
        //&& typeof body.results[0].photos == 'undefined'
            if(response.statusCode != 200 )
            {
                sendMessage(sender, {text: 'Sorry! 404 😲'});
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
                sendTemplate(sender, elements);
            }
      });
};
