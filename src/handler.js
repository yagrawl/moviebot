// API.ai email : moviebot3
const apiaiApp = require('apiai')(process.env.APIAI_API_KEY);

import * as template from './templates.js'
import * as movie from './movie.js'

let movieId;
let posterUrl;

export let message = function(sender, message) {
    senderAction(sender);
    switch(message) {
        case "Details":
            movie.details(sender, movieId);
            break;

        case "See Poster":
            template.sendImage(sender, posterUrl);
            break;

        case "Next":
        default:
            let dets = movie.random(sender);
            movieId = dets[0];
            posterUrl = dets[1];
            break;
    }
};

export let attachment = function(sender, attachment) {
    senderAction(sender);
};

export let postback = function(sender, postback) {
    senderAction(sender);
};

export let details = function (sender) {
    console.log(`Getting ID to ${movieId} @details`);
    senderAction(sender);
};

let senderAction = function(sender) {
    template.sendSenderAction(sender, "mark_seen");
    template.sendSenderAction(sender, "typing_on");
};
