const request = require('request');

// generic function sending messages
export function sendMessage(sender, message) {
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
export function sendImage(sender, url) {
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
export function sendTemplate(sender, elements) {
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
export function sendButton(sender, title, buttons) {
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
