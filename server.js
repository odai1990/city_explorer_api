'use strict';

const express = require('express');
require('dotenv').config();
const pg = require('pg');
const cors = require('cors');
const server = express();
const PORT = process.env.PORT || 5000;
const superagent = require('superagent');
// const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });

server.use(cors());

server.get('/', rr);
server.get('/location', locatine);
server.get('/weather', weather);
server.get('/parks', park);
server.get('/movies', movies);
server.get('/yelp', yelp);

server.get('*', all);
function rr(req, res) {
    res.send('you server is working')
}


function Location(cityName, geoData) {

    this.search_query = cityName;
    this.formatted_query = geoData[0].display_name;
    this.latitude = geoData[0].lat;
    this.longitude = geoData[0].lon;
    this.addToDataBase = function () {
        let SQL = `INSERT INTO locations (search_query,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4) RETURNING *;`;
        let safeValues = [this.search_query, this.formatted_query, this.latitude, this.longitude];
        client.query(SQL, safeValues)
            .then(result => {
                return (result.rows);
            })
            .catch(error => {
                return (error);
            })
    }
}


function locatine(req, res) {
    let cityName = req.query.city;
    const queryDataBase = 'SELECT * FROM locations WHERE search_query = $1';
    const valuesDataBase = [req.query.city];

    client.query(queryDataBase, valuesDataBase)
        .then(result => {
            if (result.rows.length > 0) {
                res.send(result.rows[0]);
                console.log(11111111111)
            } else {
                console.log(22222222)
                let key = process.env.LOCATION_KEY;
                let LocURL = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`;
                superagent.get(LocURL)
                    .then(geoData => {

                        let gData = geoData.body;

                        const locationData = new Location(cityName, gData);
                        locationData.addToDataBase();
                        res.send(locationData);
                    })
            }


        })
        .catch(error => {
            res.send(error);
        })

}





function weather(req, res) {
    let cityName = req.query.search_query;
    // console.log(cityName)
    let key = process.env.WEATHER_KEY;
    let LocURL = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityName}&key=${key}`;

    superagent.get(LocURL)
        .then(geoData => {
            let gData = geoData.body;
            let data = [];
            gData.data.map(el => {
                data.push(new Weather(el));
            })
            res.send(data);
        })
}
function Weather(gData) {
    this.forecast = gData.weather.description;
    this.time = gData.valid_date;
}

function Park(gData) {

    this.name = gData.name;
    this.address = gData.address;
    this.fee = gData.fee;
    this.description = gData.description;
    this.url = gData.url;
}
function park(req, res) {
    let cityName = req.query.search_query;
    let key = process.env.PARK_KEY;
    let LocURL = `https://developer.nps.gov/api/v1/parks?q=${cityName}&api_key=${key}`;
    superagent.get(LocURL)
        .then(geoData => {
            let gData = geoData.body;

            let dataPark = [];
            gData.data.map(el => {
                dataPark.push(new Park(el));
            })
            res.send(dataPark);
        })


}


function Movies(gData) {

    this.title = gData.original_title;
    this.overview = gData.overview;
    this.average_votes = gData.vote_average;
    this.total_votes = gData.vote_count;
    this.image_url = `https://image.tmdb.org/t/p/w500/${gData.poster_path}`;
    this.popularity = gData.popularity;
    this.released_on = gData.release_date;
}
function movies(req, res) {
    let cityName = req.query.search_query;
    console.log(req.query.search_query)
    let key = process.env.MOVIES;
    let LocURL = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${cityName}`;
    superagent.get(LocURL)
        .then(geoData => {
            let gData = geoData.body.results;

            let datamovies = [];
            gData.map(el => {
                datamovies.push(new Movies(el));
            })
            res.send(datamovies);
        })
}

function Yelp(gData) {

    this.name = gData.name;
    this.image_url = gData.image_url;
    this.price = gData.price;
    this.rating = gData.rating;
    this.url = gData.url;
}
function yelp(req, res) {
    let cityName = req.query.search_query;
    console.log(req.query.search_query)
    let key = process.env.YELP;
    const numberOfbage = 5;
    const start = ((req.query.page - 1) * numberOfbage + 1);
    let LocURL = `https://api.yelp.com/v3/businesses/search?term=restaurant&location=${cityName}&limit=${numberOfbage}&offset=${start}`;
    superagent.get(LocURL)
        .set('Authorization', `Bearer ${key}`)
        .then(geoData => {
            let gData = geoData.body.businesses;

            let datayelp = [];
            gData.map(el => {
                datayelp.push(new Yelp(el));
            })
            res.send(datayelp);
        })
}

function Yelp(gData) {

    this.name = gData.name;
    this.image_url = gData.image_url;
    this.price = gData.price;
    this.rating = gData.rating;
    this.url = gData.url;
}



function all(req, res) {
    let err = {
        status: 500,
        responseText: "Sorry, something went wrong"
    }
    res.status(500).send(err);
}

client.connect()
    .then(() => {
        server.listen(PORT, () =>
            console.log(`listening on ${PORT}`)
        );
    })