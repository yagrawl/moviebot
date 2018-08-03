const request = require('request');

export let sendSenderAction = function (sender, action) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: {
        recipient: {id: sender},
        sender_action: action
    }
  }, function(error, response, body) {
      if (error) {
          console.log('Error sending message: ', error);
      } else if (response.body.error) {
          console.log('Error: ', response.body.error);
      }
  });
}

// generic function sending messages
export let sendMessage = function (sender, message) {
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
export let sendImage = function (sender, url) {
  let message = {
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
export let sendTemplate = function (sender, elements) {
  let message = {
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
export let sendButton = function (sender, title, buttons) {
  let message = {
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

export let sendQuickButton = function (sender) {
  let message = {
              "quick_replies":[
                {
                  "content_type":"text",
                  "title":"YES",
                  "payload":"yes",
                }
              ]
          };

  sendMessage(sender, message);
};
