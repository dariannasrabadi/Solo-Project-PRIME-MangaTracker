const express = require('express');
const pool = require('../modules/pool.js');
//Needed to access the REST API of M.A.L.
const Client = require('node-rest-client').Client;
const router = express.Router();

//Setting user and password for M.A.L. authentication, need to place in .env file
let options_auth = { user: process.env.MAL_USER, password: process.env.MAL_PASSWORD };

let client = new Client(options_auth);


router.get('/', (req, res) => {
    client.get("https://myanimelist.net/api/manga/search.xml?q=isekai", function (data, response) {
        // parsed response body as js object 
        //Adding the .manga.entry directly opens each manga details right away.
        console.log('data from client get',data.manga.entry);
        res.send(data.manga.entry);
        // console.log('this is the raw response',response);
    });
}); // end get

module.exports = router;
