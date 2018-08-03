// API.ai email : moviebot3
const apiaiApp = require('apiai')(process.env.APIAI_API_KEY);

import * as template from './templates.js'
import * as movie from './movie.js'

export let message = function(sender, message) {
    senderAction(sender);
    if(message === 'Details') {
        movie.details(sender);
    } else if(message === 'See Poster') {
        movie.poster(sender);
    } else if(message === 'Next' || message === 'Hi') {
        movie.random(sender);
    } else {
        template.sendMessage(sender, {text: "Try saying 'Hi' :) "})
    }
};

export let attachment = function(sender, attachment) {
    senderAction(sender);
};

export let postback = function(sender, postback) {
    senderAction(sender);
    if(message === 'Random Movie') {
        movie.random(sender);
    } else if(message === 'Help') {
        template.sendMessage(sender, {text: "Just say 'Hi' and get movie recommendations :) "})
    } else {
        movie.random(sender);
    }
};

let senderAction = function(sender) {
    template.sendSenderAction(sender, "mark_seen");
    template.sendSenderAction(sender, "typing_on");
};
