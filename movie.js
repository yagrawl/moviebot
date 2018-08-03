const request = require('request');

import * as template from './templates.js'

// The MovieDB API variables
const TMDB_API_KEY = '?api_key=' + process.env.TMDB_API_KEY;
const MOVIE_INFO_BASE_URL = 'https://api.themoviedb.org/3/movie/';
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
        url: MOVIE_INFO_BASE_URL + 'popular'  + TMDB_API_KEY  + '&page='+id,
        headers: {
            'Accept': 'application/json'
        }
    },
        function (error, response, body) {
            console.log('Status:', response.statusCode);
            let Movies = JSON.parse(body);
            if(response.statusCode != 200)
            {
                sendMessage(sender, {text: 'Sorry! 404 😲'});
                help(sender);
            }
            else {

                let i = Math.floor((Math.random() * 19) + 1);
                let IDPop = Movies.results[i].id.toString();
                let IDGlobal = IDPop;
                let Poster = POSTER_BASE_URL + Movies.results[i].poster_path;
                let overview = Movies.results[i].overview;
                console.log('Movie ID: ', IDPop);
                console.log('Movie: ', Movies.results[i].title);
                let elements = [{
                        "title": Movies.results[i].title,
                        "subtitle": Movies.results[i].release_date.slice(0,4),
                        "image_url": POSTER_BASE_URL + Movies.results[i].poster_path,
                    }];
                template.sendTemplate(sender, elements);
                setTimeout(function() {
                    template.sendQuickButton(sender, overview);
                }, 3000);
            }
        });
};
