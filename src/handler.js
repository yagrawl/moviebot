// API.ai email : moviebot3
const apiaiApp = require('apiai')(process.env.APIAI_API_KEY);

import * as template from './templates.js'
import * as movie from './movie.js'

export let message = function(sender, message) {
    senderAction(sender);
    if(message === 'Details') {
        movie.details(sender);
    } else if(message === 'See Poster') {
        template.sendImage(sender, movie.posterUrl);
    } else if(message === 'Next' || message === 'Hi') {
        movie.random(sender);
    }
    // switch(message) {
    //     case "Details":
    //         movie.details(sender);
    //         break;
    //
    //     case "See Poster":
    //         template.sendImage(sender, posterUrl);
    //         break;
    //
    //     case "Next":
    //     default:
    //         movie.random(sender);
    //         break;
    // }
};

export let attachment = function(sender, attachment) {
    senderAction(sender);
};

export let postback = function(sender, postback) {
    senderAction(sender);
};

let senderAction = function(sender) {
    template.sendSenderAction(sender, "mark_seen");
    template.sendSenderAction(sender, "typing_on");
};
