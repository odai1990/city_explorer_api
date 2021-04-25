'use strict';

 const express = require('express'); 
 require('dotenv').config(); 

 const cors = require('cors');
 const server = express();
 const PORT = process.env.PORT || 5000;

 server.use(cors());

 server.get('/',(req,res)=>{
     res.send('you server is working')
 })


 server.get('/location',(req,res)=>{

     let Data = require('./data/location.json');
     let locationData = new Location (Data);
     res.send(locationData);
 })

 function Location(locData) {


    this.search_query = 'Lynnwood';
    this.formatted_query = locData[0].display_name;
     this.latitude = locData[0].lat;
     this.longitude = locData[0].lon;
 }

 server.get('/weather',(req,res)=>{
     let data=[];
     let Data = require('./data/weather.json');
  Data.data.map(el=>
     {
      data.push(new Weather (el));
     })

     res.send(data);
 })


 function Weather(locData) {

 console.log(locData)
 this.forecast = locData.weather.description;
 this.time = locData.valid_date;
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