const express = require('express');
const pool = require('../modules/pool.js');
//Needed to access the REST API of M.A.L.
const Client = require('node-rest-client').Client;
const router = express.Router();

//Setting user and password for M.A.L. authentication, need to place in .env file
let options_auth = { user: process.env.MAL_USER, password: process.env.MAL_PASSWORD };

let client = new Client(options_auth);


router.get('/:search', (req, res) => { // Start of search results for M.A.L. API.
    client.get(`https://myanimelist.net/api/manga/search.xml?q=${req.params.search}`, function (data, response) {
        // parsed response body as js object 
        //Adding the .manga.entry directly opens each manga details right away.
        console.log('data from client get',data.manga.entry);
        res.send(data.manga.entry);
        // console.log('this is the raw response',response);
    });
}); // end get search results

router.post('/', (req, res) => { //Start post of add new favorites.
    // console.log('Manga Information', req.body);
    // please see my-manga-tracker.sql for how the table is created.
    // Checking for duplicates per user is done on the said .sql sheet. 
    let queryText = `INSERT INTO favorites (manga_name, manga_id, user_id, manga_image_url, latest_chapter)
                     VALUES ('${req.body.title}', '${req.body.id}', '${req.user.id}', '${req.body.image}', '${req.body.chapters}');`
    pool.query(queryText)
        .then((result) => {
            res.sendStatus(200);
        })
        .catch((err) => {
            console.log('Error making update query', err);
            res.sendStatus(500);
        });
}); // end post of add new favorites.

router.get('/', (req, res) => { // Start of GET to retrieve favorites from SQL Database.
    let queryText = `SELECT * FROM favorites
                     WHERE user_id = ${req.user.id};`    //User ID is used to determine the current user that is logged on so it pulls their favorites.
    pool.query(queryText)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log('Error making get favorites query', err);
            res.sendStatus(500);
        });
}); // end of GET to retrieve favorites from SQL Database


module.exports = router;
