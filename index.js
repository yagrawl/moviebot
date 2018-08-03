/**
 * Moviebot v.2.0
 * Author : Yash Agrawal (https://yagrawal.com)
 * The following is a script based code for Moviebot accessible at https://m.me/moviebots
 * It uses Google's API.ai for NLP and TMDb API for movie data. Also leverages microsoft's CV API
 * (for users that tried to break the bot using images) and finally, Google's places API to suggest
 * nearby theatres
 */

/**
 * Hosted on heroku (email : yagrawl2@gmail.com)
 * All API keys stored in config vars on Heroku for protection purposes.
 * If you want to use this code for your own bot, get API keys from TMDB, API.ai, Google places and Microsoft CV
 */

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

// API.ai email : moviebot3
const apiaiApp = require('apiai')(process.env.APIAI_API_KEY);

// The MovieDB API variables
const TMDB_API_KEY = '?api_key=' + process.env.TMDB_API_KEY;
const MOVIE_INFO_BASE_URL = 'https://api.themoviedb.org/3/movie/';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const IMDB_BASE_URL = 'www.imdb.com/title/';

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', (req, res) => {
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

app.post('/webhook', (req, res) => {
  let events = req.body.entry[0].messaging;
  for (i = 0; i < events.length; i++) {
    let event = events[i];
    let sender = event.sender.id;
    if (event.message && event.message.text) {
      sendMessage(sender, {text: 'BOT DOWN'});
    }
});

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
