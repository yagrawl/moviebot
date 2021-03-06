const request = require('request');

import * as template from './templates.js'
import * as handler from './handler.js'

// The MovieDB API variables
const TMDB_API_KEY = '?api_key=' + process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3/movie/';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const IMDB_BASE_URL = 'www.imdb.com/title/';

let movieId;
let posterUrl;

/**
 * Random movie generator.
 * Call the API to return the most popular movies and
 * randomly select one. Also keep track of the movieid
 * to receive additional details if asked by the user
 */
export let random = function (sender) {

    let id = (Math.floor((Math.random() * 30) + 1)).toString();
    request({
        method: 'GET',
        url: TMDB_BASE_URL + 'popular'  + TMDB_API_KEY  + '&page='+id,
        headers: {
            'Accept': 'application/json'
        }
    },
    function (error, response, body) {
        let Movies = JSON.parse(body);

        if(response.statusCode != 200)
        {
            template.sendMessage(sender, {text: 'Sorry! 404 😲'});
        }

        else {

            let i = Math.floor((Math.random() * 19) + 1);
            movieId = Movies.results[i].id.toString();
            let title = Movies.results[i].title;
            let year = Movies.results[i].release_date.slice(0,4);
            posterUrl = POSTER_BASE_URL + Movies.results[i].poster_path;
            let overview = Movies.results[i].overview;

            if(overview.indexOf('.') !== -1){
                overview = overview.slice(0, overview.indexOf('.') + 1);
            } else {
                overview = overview.slice(0, 30);
            }

            let elements = [{
                    "title": title,
                    "subtitle": year,
                    "image_url": posterUrl,
                }];

            template.sendTemplateGeneric(sender, elements);
            setTimeout(function() {
                template.sendQuickButton(sender, overview);
            }, 1500);
        }
    });
};

export let search = function (sender, movieName) {
    request({
        method: 'GET',
        url: 'http://api.themoviedb.org/3/search/movie' + TMDB_API_KEY + '&query=' + movieName,
        headers: {
            'Accept': 'application/json'
        }
    }, function (error, response, body) {
        if(response.statusCode != 200) {
            template.sendMessage(sender, {text: 'Sorry! 404 😲'});
        } else {
            let Movies = JSON.parse(body);
            if(typeof Movies.results[0] !== 'undefined'){
                let j = 0;
                if(Movies.total_results >= 1 || Movies.results[0].title == Input) {
                    if(Movies.total_results > 5) {
                        for(let i = 0; i < 6; i++) {
                            if(Movies.results[i].vote_average > Movies.results[j].vote_average) {
                                j = i;
                            }
                        }
                    }
                }

                movieId = Movies.results[j].id.toString();
                posterUrl = POSTER_BASE_URL + Movies.results[j].poster_path;
                let title = Movies.results[j].title;
                let year = Movies.results[j].release_date.slice(0,4);
                let overview = Movies.results[j].overview;

                if(overview.indexOf('.') !== -1){
                    overview = overview.slice(0, overview.indexOf('.') + 1);
                } else {
                    overview = overview.slice(0, 30);
                }

                let elements = [{
                        "title": title,
                        "subtitle": year,
                        "image_url": posterUrl,
                    }];

                template.sendTemplateGeneric(sender, elements);
                setTimeout(function() {
                    template.sendQuickButton(sender, overview);
                }, 1500);
            }
        }
    });
};

export let details = function (sender) {
    request({
        method: 'GET',
        url: TMDB_BASE_URL + movieId + TMDB_API_KEY,
        headers: {
            'Accept': 'application/json'
        }
    },
        function (error, response, body) {
            let Movie = JSON.parse(body);
            if(response.statusCode != 200)
            {
                template.sendMessage(sender, {text: 'Sorry! 404 😲'});
            }
            else {
                let title = Movie.title;
                let id = Movie.id;
                let tag = Movie.tagline;
                let poster = POSTER_BASE_URL + Movie.poster_path;
                let imdb = IMDB_BASE_URL + Movie.imdb_id;
                let moviecast = cast(id);
                console.log('Sent Promise');
                let elements = [{
                        "title": title,
                        "subtitle": tag,
                        "image_url": poster,
                    }];

                moviecast.then(credits => {
                    let castNo = credits.cast.length;
                    if(castNo >= 3) { castNo = 3; }
                    console.log(credits.cast[0].character)
                    for(let i = 0; i < castNo; i++)
                    {
                        if(typeof credits.cast[i].profile_path !== 'undefined')
                        {
                            var CastProfile = POSTER_BASE_URL + credits.cast[i].profile_path ;
                        }
                        else{
                            var CastProfile = "http://i.imgur.com/uO5oB4q.jpg";
                        }
                        elements.push({"title": credits.cast[i].character,
                                    "subtitle": credits.cast[i].name,
                                    "image_url": CastProfile
                        });
                   }
                });

                let buttons = [
                      {
                          "type": "web_url",
                          "url": imdb,
                          "title": "More Info"
                    }];

                setTimeout(function() {
                        template.sendTemplateList(sender, elements, buttons);
                }, 3000);

                setTimeout(function() {
                        template.sendQuickButtonNext(sender, "Next Movie?");
                }, 4500);
            }
        });
}

export let cast = function(id) {
    return new Promise((resolve, reject) => {
        request({
            method: 'GET',
            url: TMDB_BASE_URL + id + '/credits' + TMDB_API_KEY,
            headers: {
                'Accept': 'application/json'
            }}, function (error, response, body) {
                    console.log('Resolved Promise');
                    resolve(JSON.parse(body));
            });
    }
)};

export let poster = function(sender) {
    template.sendImage(sender, posterUrl);
    setTimeout(function() {
            template.sendQuickButtonNext(sender, "Next Movie?");
    }, 2500);
}
