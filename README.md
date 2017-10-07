# Moviebot

### What?
Moviebot is a messenger based bot that uses TMDb's API to recommend movies. It can recommend a random movie from a collection of popular titles, or accordingly to genre. Since people started using the bot, I kept on adding features as asked by users. The bot can now search based on artists and show their top 3 movies. It can also search for a movie name and come with up with similar titles.
It also uses Google's API.ai to understand natural language and also has smalltalk agent embedded.

### Why?
I like watching movies and a lot of times I waste time finding the right movie to watch, so I thought of making a bot that recommend/suggest movies to watch.

### Dependencies
The bot uses the messenger platform and is accessible at https://m.me/moviebots
It is hosted on heroku on also uses node packages like express, body-parser and request

Following APIs are also used :
* API.ai - For natural language processing
* TMDb - Movie data
* Google's Places API - Returns Theatres near a location pin
* Microsoft's CV API - No particular reason

NLP API switched from IBM Watson's conversation API to API.ai

### Usage
It is accessible at https://m.me/moviebots. If you want to use the code for your own bot, remember to switch the API keys. For security purposes the API keys are added to the config vars on heroku so before using the obtain and change keys. Custom training exports can be found in the `NLP backup` folder.

### More Info
More info can be found at https://yagrawal.com/moviebot.html
