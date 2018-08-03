const request = require('request');

import * as template from './templates.js'
import * as handler from './handler.js'

// The MovieDB API variables
const TMDB_API_KEY = '?api_key=' + process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3/movie/';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const IMDB_BASE_URL = 'www.imdb.com/title/';

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
            let movieId = Movies.results[i].id.toString();
            console.log(`Setting ID to ${movieId} @random`);
            let title = Movies.results[i].title;
            let year = Movies.results[i].release_date.slice(0,4);
            let posterUrl = POSTER_BASE_URL + Movies.results[i].poster_path;
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
            }, 3000);
        }

        return [movieId, posterUrl];
    });
};

export let details = function (sender, id) {
    console.log(`Getting ID to ${movieId} @movie.details`);
    request({
        method: 'GET',
        url: TMDB_BASE_URL + id + TMDB_API_KEY,
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
                console.log(imdb);
                console.log(title);
                let elements = [{
                        "title": title,
                        "subtitle": tag,
                        "image_url": poster,
                    }, {
                        "title": "random",
                        "subtitle": "tag",
                        "image_url": "http://i.imgur.com/Q05B72u.png",
                    }
                ];

                let buttons = [
                      {
                          "type": "web_url",
                          "url": imdb,
                          "title": "IMDB"
                    }];

                template.sendTemplateList(sender, elements, buttons);
            }
        });
}
