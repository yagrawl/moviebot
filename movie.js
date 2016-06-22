var request = require('request');
var mId = Math.floor((Math.random() * 1000) + 1);
var APIkey = '?api_key=69c569210010a0db6bf4197759641bb1';
var baseUrl = 'https://api.themoviedb.org/3/movie/';
module.exports = function (callback){

}

request({
  method: 'GET', json:true,
  url: baseUrl + mId + APIkey,
  headers: {
    'Accept': 'application/json'
  }}, function (error, response, body) {
  console.log('Response:', body);
  console.log('Original Title:', body.original_title);
  console.log('Popularity: ', body.popularity);
  var title = body.original_title ;
});
