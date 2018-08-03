// "use strict";

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

import * as template from './templates.js'
import * as handler from './handler.js'

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
    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        let sender = event.sender.id;

        if(event.message) {
            if (event.message.text) {
                handler.message(sender, event.message.text);
            } else if (event.message.attachments) {
                handler.attachment(sender, event.message.attachments);
            }
        } else if (event.postback && event.postback.payload) {
            handler.postback(sender, event.postback.payload);
        }
    }
    res.sendStatus(200);
});
