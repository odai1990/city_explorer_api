'use strict';

 const express = require('express'); 
 const superagent = require('superagent'); 
 require('dotenv').config(); 

 const cors = require('cors');
 const server = express();
 const PORT = process.env.PORT || 5000;

 server.use(cors());

 server.get('/',(req,res)=>{
     res.send('you server is working')
 })
 server.get('/location', locatine);
 server.get('/weather', weather);
 server.get('/parks', park);

 

 function Location(cityName, geoData) {


    this.search_query = cityName;
    this.formatted_query = geoData[0].display_name;
    this.latitude = geoData[0].lat;
    this.longitude = geoData[0].lon;
 }

 function locatine(req,res) {

    let cityName = req.query.city;
    let key = process.env.LOCATION_KEY;
    let LocURL = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`;
    superagent.get(LocURL)
        .then(geoData => {

            let gData = geoData.body;
            const locationData = new Location(cityName, gData);        
            res.send(locationData);
        })
}

 function weather(req, res) {
    let cityName = req.query.search_query;
 
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

 server.get('*',(req,res)=>{

     let err = {
         status: 500,
         responseText: "Sorry, something went wrong"
     }
     res.status(500).send(err);
 })

 server.listen(PORT,()=>{
     console.log(`Listening on PORT ${PORT}`)
 })