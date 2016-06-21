var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is the MovieBot server');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

var imageR = [  "http://gdj.gdj.netdna-cdn.com/wp-content/uploads/2011/12/grey-movie-poster.jpg",
                "http://gdj.gdj.netdna-cdn.com/wp-content/uploads/2011/12/grey-movie-poster.jpg",
                "http://gdj.gdj.netdna-cdn.com/wp-content/uploads/2011/12/grey-movie-poster.jpg",
                "https://cdn2.vox-cdn.com/thumbor/bIvStQ6vUZ3NWfdIrRl8mBAqrzw=/cdn0.vox-cdn.com/uploads/chorus_asset/file/6326235/Hollywood-Movie-captain-america-the-winter-soldier-2014-movie-poster.jpg",
                "http://www.seat42f.com/wp-content/uploads/2014/08/BEFORE-I-GO-TO-SLEEP-Movie-Poster.jpg",
                "http://www.fatmovieguy.com/wp-content/uploads/2015/11/The-Huntsman-Winters-War-Movie-Poster-Charlize-Theron.jpg",
                "http://4.bp.blogspot.com/-7og3JJt2EaY/Tpx15P4ZlUI/AAAAAAAADaY/YpS3TWofg7Y/s1600/Johnny+English+Reborn+Movie+Wallpaper.jpeg",
                "https://farm9.staticflickr.com/8726/17313323431_69d34a4f25_o.jpg",
                "http://www.impawards.com/intl/uk/2013/posters/about_time.jpg",
                "http://www.movie-poster-artwork-finder.com/posters/morning-glory-poster-artwork-harrison-ford-rachel-mcadams-diane-keaton.jpg",
                "https://s-media-cache-ak0.pinimg.com/736x/33/df/ab/33dfabdb1eef83e6c9147db6fb6372a5.jpg",
                "http://www.movie-poster-artwork-finder.com/posters/sherlock-holmes-2009-poster-artwork-robert-downey-jr-jude-law-rachel-mcadams.jpg",
                "https://www.movieposter.com/posters/archive/main/56/MPW-28318",
                "http://www.impawards.com/2006/posters/departed_ver9.jpg",
                "http://www.impawards.com/2012/posters/vow_ver2_xlg.jpg",
                "http://cdn.collider.com/wp-content/image-base/Movies/T/Time_Travelers_Wife/posters/The%20Time%20Travelers%20Wife%20movie%20poster.jpg",
                "http://www.newdvdreleasedates.com/images/posters/large/this-is-40-2012-03.jpg",
                "http://moviecultists.com/wp-content/uploads/2011/12/American-Reunion-movie-poster.jpg",
                "https://moviemanjackson.files.wordpress.com/2014/11/hbposter.jpg",
                "http://www.impawards.com/2010/posters/due_date_xlg.jpg",
                "http://www.impawards.com/2014/posters/other_woman_ver2_xlg.jpg",
                "http://i.dailymail.co.uk/i/pix/2015/06/06/21/2968A2DE00000578-0-image-a-112_1433624173664.jpg",
                "https://themoviemusings.files.wordpress.com/2014/10/gone-girl-poster.jpg",
                "http://media2.popsugar-assets.com/files/2014/08/04/874/n/1922398/72e18dbc93806fd8_thumb_temp_image33115181406937918/i/Best-Rachel-McAdams-Moments-Video.jpg",
                "http://cdn.rsvlts.com/wp-content/uploads/2013/03/Lily-Aldridge-Victorias-Secret-78.jpg",
                "https://s-media-cache-ak0.pinimg.com/736x/53/0d/97/530d97eb70b9a7a46be9fe5b661eac2b.jpg",
                "http://celebmafia.com/wp-content/uploads/2015/08/arielle-vandenberg-2015-mtv-video-music-awards-at-microsoft-theater-in-los-angeles_3.jpg",
                "http://1.bp.blogspot.com/-Ez5r6kFJUT4/UAdAmsDb3NI/AAAAAAAAD3E/i-M1k2DE4LI/s1600/sara+sampaio+H+&+M.jpg",
                "http://4.bp.blogspot.com/-x1mFPxL5Zbo/VZsE3WqIxUI/AAAAAAAB6ZI/ukv6ncqliSY/s1600/V553483_CROP1.jpg",
                "http://www3.pictures.zimbio.com/pc/Dutch+model+actress+Doutzen+Kroes+seen+showing+V2rg_1Vn27ex.jpg",
                "https://myheromotocorp.files.wordpress.com/2011/09/alessandra-ambrosio-vs-bikini2-03.jpg",
                "https://mrpopat.in/admin/upload/wallpaper/201311081383915204356108201.jpeg",
                "http://www.laughspark.info/uploadfiles/megan-fox-hot-body-635668868863449122-11168.jpg",
                "https://s-media-cache-ak0.pinimg.com/736x/20/10/51/201051b7818c3173d41c9268efcdce2c.jpg",
                "http://hotorbeast.com/wp-content/uploads/2015/05/rtaylor-gallery20.jpg",
                "http://vignette1.wikia.nocookie.net/almost-human/images/a/ac/Minka_Kelly.jpg",
                "http://tomandlorenzo.com/wp-content/uploads/2015/05/Taylor-Swift-2015-Billboard-Music-Awards-Red-Carpet-Fashion-Balmain-Tom-Lorenzo-Site-TLO-1.jpg",
                "http://4.bp.blogspot.com/-vyJyboVddJQ/Uoy-m46Z0gI/AAAAAAAAA4w/XaHn6F7QAPg/s1600/selena-gomez-sexy-bikini-picture.jpg",
                "http://i.imgur.com/LD0sH0s.jpg",
                "http://www.magment.com/wp-content/uploads/2015/11/Hilary-Duff-2.jpg",
                "http://www.hollywoodtake.com/sites/default/files/styles/large/public/2014/01/21/jennifer-connelly.jpg",
                "http://celebslam.celebuzz.com//bfm_gallery/2014/01/Margot%20Robbie%20Internet%20Nudes/gallery_enlarged/gallery_enlarged-margot-robbie-wolf-wall-street-nude-09.jpg",
                "http://www.speakerscorner.me/wp-content/uploads/2016/02/josephine28.jpg",
                "https://s-media-cache-ak0.pinimg.com/736x/ef/eb/81/efeb813a5548896b0511808dae54f377.jpg",
                "http://3.bp.blogspot.com/-Em9nOXWPBLc/UF1s64MEGwI/AAAAAAAACsI/8Tc2bNdQ8UU/s1600/kristen+stewart+hot+wallpapers55.jpg",
                "http://i.imgur.com/YodsyhS.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/6/6a/Ana_Beatriz_Barros.jpg",
                "http://www.twistedlifestyle.com/Images/Victorias-Secret-Swim-2013-Catalogue-002.jpg",
                "http://cdn.sortrashion.com/wp-content/uploads/2014/03/karlie-kloss-lingerie06.jpg",
                "https://s-media-cache-ak0.pinimg.com/736x/04/09/ea/0409eac46d386034cb14a5c882a06343.jpg",
                "http://www.moviemagik.in/files/actors/907/denise-brichards-nose-job-1437589757.jpg",
                "http://1.bp.blogspot.com/-RUpux6to0lk/UXj0FUsDrDI/AAAAAAAAAfg/Up0RTt1fGzg/s1600/Red-hot-Esha-Gupta-displays-her-ethnic-side-in-Jannat-2-Movie.jpg"
            ];


// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
        	switch(event.message.text) {
        	
        		case "Hi":
        		case "hi":
        		case "Hey":
        			sendMessage(event.sender.id, {text: "Hello!"});
        			break;

        		case "Thanks":
        		case "thank you":
        		case "Thank you":
        			sendMessage(event.sender.id, {text: "You are very welcome!"});
        			break;

                case "exit":
                case "bye":
                case "Exit":
                case "quit":
                    sendMessage(event.sender.id, {text: "Goodbye! Have a nice day!"});
                    break;    
                        		
        		case "Suggest A Movie":
        		case "Suggest a movie":
        			suggestAMovie(event.sender.id, event.message.text);
        			break;

        		case "Suggest Another":
        		case "Suggest another":
        			suggestAnother(event.sender.id, event.message.text);
        			break;

        		case "Suggest some more movies":
        			multipleMovies(event.sender.id, event.message.text);
        			break;

        		case "More Movies":
        			moreMovies(event.sender.id, event.message.text);
        			break;

                case "Random poster":
                    sendImage(event.sender.id, event.message.text);
                    break;

        		default:
        			sendMessage(event.sender.id, {text: "Sorry, didn't get that!"});
        	
        	}
    	}	
    }
    res.sendStatus(200);
});

// generic function sending messages
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

function sendImage(recipientId, message) {
    for(i = 0; i < 3; i++)
    {
        message = {
            "attachment": {
                "type": "image",
                "payload": {
                    "url": imageR[Math.floor((Math.random() * 50) + 1)
                } 
            }
        };
        sendMessage(recipientId, message);
    }
};

function moreMovies(recipientId, text){
	var imageUrl1 = "http://designbuddy.com/wp-content/uploads/2012/12/saul-bass-poster-design.jpg";
	var imageUrl2 = "https://www.movieposter.com/posters/archive/main/4/MPW-2244";
	var imageUrl3 = "http://cdn.mos.cms.futurecdn.net/8e5f9fab8d96968fc28267a4ed4a6707-650-80.jpg";
	var imageUrl4 = "http://pixartimes.com/wp-content/uploads/2015/03/Inside-Out-Official-Poster.jpg";
	var movieUrl1 = "http://www.imdb.com/title/tt0081505/";
	var movieUrl2 = "http://www.imdb.com/title/tt0137523/"; 
	var movieUrl3 = "http://www.imdb.com/title/tt1645170/";
	var movieUrl4 = "http://www.imdb.com/title/tt0758758/";
	message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "The Shining",
                            "subtitle": "Horror",
                            "image_url": imageUrl1 ,
                            "buttons": [{
                                "type": "web_url",
                                "url": movieUrl1,
                                "title": "IMDB"
                                }, {
                                "type": "postback",
                                "title": "More Movies",
                                "payload": "More Movies",
                            }]
                        },
                        {
                            "title": "Fight Club",
                            "subtitle": "Thriller",
                            "image_url": imageUrl2 ,
                            "buttons": [{
                                "type": "web_url",
                                "url": movieUrl2,
                                "title": "IMDB"
                                }, {
                                "type": "postback",
                                "title": "More Movies",
                                "payload": "More Movies",
                            }]
                        },{
                            "title": "The Dictator",
                            "subtitle": "Comedy",
                            "image_url": imageUrl3 ,
                            "buttons": [{
                                "type": "web_url",
                                "url": movieUrl3,
                                "title": "IMDB"
                                }, {
                                "type": "postback",
                                "title": "More Movies",
                                "payload": "More Movies",
                            }]
                        },
                        {
                            "title": "Inside Out",
                            "subtitle": "Animated",
                            "image_url": imageUrl4 ,
                            "buttons": [{
                                "type": "web_url",
                                "url": movieUrl4,
                                "title": "IMDB"
                                }, {
                                "type": "postback",
                                "title": "More Movies",
                                "payload": "More Movies",
                            }]
                        }]
                    }
                }
            };
    
            sendMessage(recipientId, message);

};


function multipleMovies(recipientId, text){
	var imageUrl1 = "http://imgc.allpostersimages.com/images/P-473-488-90/71/7105/HXVV100Z/posters/the-hunt-jagten-movie-poster.jpg";
	var imageUrl2 = "http://cdn3-www.comingsoon.net/assets/uploads/gallery/the-big-short/tbs_1-sht_teaser.jpg";
	var imageUrl3 = "http://www.impawards.com/intl/uk/2013/posters/about_time.jpg";
	var imageUrl4 = "https://upload.wikimedia.org/wikipedia/en/8/8a/Into-the-wild.jpg";
	var movieUrl1 = "http://www.imdb.com/title/tt2106476/";
	var movieUrl2 = "http://www.imdb.com/title/tt1596363/"; 
	var movieUrl3 = "http://www.imdb.com/title/tt2194499/";
	var movieUrl4 = "http://www.imdb.com/title/tt0758758/";
	message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Jagten",
                            "subtitle": "Drama",
                            "image_url": imageUrl1 ,
                            "buttons": [{
                                "type": "web_url",
                                "url": movieUrl1,
                                "title": "IMDB"
                                }, {
                                "type": "postback",
                                "title": "More Movies",
                                "payload": "More Movies",
                            }]
                        },
                        {
                            "title": "The Big Short",
                            "subtitle": "Drama",
                            "image_url": imageUrl2 ,
                            "buttons": [{
                                "type": "web_url",
                                "url": movieUrl2,
                                "title": "IMDB"
                                }, {
                                "type": "postback",
                                "title": "More Movies",
                                "payload": "More Movies",
                            }]
                        },{
                            "title": "About Time",
                            "subtitle": "Romance",
                            "image_url": imageUrl3 ,
                            "buttons": [{
                                "type": "web_url",
                                "url": movieUrl3,
                                "title": "IMDB"
                                }, {
                                "type": "postback",
                                "title": "More Movies",
                                "payload": "More Movies",
                            }]
                        },
                        {
                            "title": "Into The Wild",
                            "subtitle": "Drama",
                            "image_url": imageUrl4 ,
                            "buttons": [{
                                "type": "web_url",
                                "url": movieUrl4,
                                "title": "IMDB"
                                }, {
                                "type": "postback",
                                "title": "More Movies",
                                "payload": "More Movies",
                            }]
                        }]
                    }
                }
            };
    
            sendMessage(recipientId, message);

};

function suggestAMovie(recipientId, text){
    var imageUrl = "http://cdn1-www.comingsoon.net/assets/uploads/gallery/the-founder/cezgbkauyaa20xx.jpg";
    var movieURL = "http://www.imdb.com/title/tt4276820/";
    message = {
        "attachment": {
        "type": "template",
        	"payload": {
            	"template_type": "generic",
            	"elements": [{
              		"title": "The Founder",
                	"subtitle": "Biography",
                	"image_url": imageUrl ,
                	"buttons": [{
                    	"type": "web_url",
                    	"url": movieURL,
                    	"title": "IMDB"
                		},{
                    	"type": "postback",
                    	"title": "Suggest Another",
                    	"payload": "Suggest Another",
                	}]
            	}]
        	}
       	}
    };
            
    sendMessage(recipientId, message);
};

function suggestAnother(recipientId, text){
    var imageUrl = "http://www.impawards.com/2010/posters/inception_ver3.jpg";
    var movieURL = "http://www.imdb.com/title/tt1375666/";
    message = {
        "attachment": {
        "type": "template",
        	"payload": {
            	"template_type": "generic",
            	"elements": [{
              		"title": "Inception",
                	"subtitle": "Thriller",
                	"image_url": imageUrl ,
                	"buttons": [{
                    	"type": "web_url",
                    	"url": movieURL,
                    	"title": "IMDB"
                		},{
                    	"type": "postback",
                    	"title": "Suggest Another",
                    	"payload": "Suggest Another",
                	}]
            	}]
        	}
       	}
    };
            
    sendMessage(recipientId, message);
};