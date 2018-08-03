// API.ai email : moviebot3
const apiaiApp = require('apiai')(process.env.APIAI_API_KEY);

import * as template from './templates.js'
import * as movie from './movie.js'


export let message = function(sender, message) {
    senderAction(sender);
    movie.random(sender);
    details(sender);
};

export let attachment = function(sender, attachment) {
    senderAction(sender);
};

export let postback = function(sender, postback) {
    senderAction(sender);
};

export let details = functions(sender) {
    senderAction(sender);
    try {
        template.sendMessage(sender, {text: movie.movieID});
    } catch {
        template.sendMessage(sender, {text: 'No Movie ID'});
    }

}

let senderAction = function(sender) {
    template.sendSenderAction(sender, "mark_seen");
    template.sendSenderAction(sender, "typing_on");
}
