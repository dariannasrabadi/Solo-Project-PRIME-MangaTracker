const express = require('express');
const pool = require('../modules/pool.js');
//Needed to access the REST API of M.A.L.
const Client = require('node-rest-client').Client;
const router = express.Router();
const axios = require('axios')


//Setting user and password for M.A.L. authentication, need to place in .env file
let options_auth = { user: process.env.MAL_USER, password: process.env.MAL_PASSWORD };

let client = new Client(options_auth);

/******************************************/
/*            GET REQUESTS              */
/******************************************/


router.get('/genres/:genre', (req, res) => { // Start of search results for M.A.L. API.
    if (req.isAuthenticated()) {
        let dataToReturn = []
        axios.get(`https://www.mangaeden.com/api/list/0/?p=0&l=1500`).then(response => {
            // console.log('These is the response from mangaeden', response.data.manga);
            for (let i = 0; i < response.data.manga.length; i++) {
                if (response.data.manga[i].c.includes(req.params.genre)) {
                    // console.log(response.data.manga[i].t);
                    if (response.data.manga[i].im == null) { //Checking if the image from Manga Eden does not exist. then replacing it with a default image.
                        response.data.manga[i].im = 'http://www.colorluna.com/wp-content/uploads/2014/03/Oscar-say-Go-Away-in-Sesame-Street-Coloring-Page.jpg' //Will change this to something else. This for now though.
                    }
                    else {
                        response.data.manga[i].im = `https://cdn.mangaeden.com/mangasimg/${response.data.manga[i].im}` //Adding the base http tag for the manga images to display on genre results page.
                    }
                    dataToReturn.push(response.data.manga[i])
                }
            }
            // console.log(dataToReturn);
            res.send(dataToReturn)
        })
            .catch(err => {
                console.log('Error searching genres mangaeden: ', err);
                res.sendStatus(500);
            });
    } else {
        res.sendStatus(403);
    }
});


/* CANT GET AXIOS TO WORK YET. SO UNABLE TO FIND WAY TO CATCH ERRORS WITH NODE-REST-CLIENT YET. */
// axios.defaults.headers.common['Authorization'] = options_auth
// router.get('/:search', (req, res) => { // Start of search results for M.A.L. API.
//     axios.get(`https://myanimelist.net/api/manga/search.xml?q=${req.params.search}`, {
//         auth: {
//           user: process.env.MAL_USER,
//           password: process.env.MAL_PASSWORD,
//         }
//       })
//         .then(response => {
//             console.log('THIS IS THE BLOOODY FING RESPONSE WOOT WOO', response);
//             res.send(response.manga.entry)
//         })
//         .catch(err => {
//             console.log('Error searching manga: ', err);
//             res.sendStatus(500);
//         });
// });


router.get('/:search', (req, res) => { // Start of search results for M.A.L. API.
    if (req.isAuthenticated()) {
        client.get(`https://myanimelist.net/api/manga/search.xml?q=${req.params.search}`, function (data, response) {
            // parsed response body as js object 
            //Adding the .manga.entry directly opens each manga details right away.
            // console.log('data from client get',data);
            if (data.hasOwnProperty('manga')) {
                if (typeof data.manga.entry === "undefined") {
                res.send(data.manga);
                }
                else {
                    res.send(data.manga.entry);
                }
            }
            else {
                res.sendStatus(500);
            }
            // console.log('this is the raw response',response);
            req.on('error', function (err) {
                console.log('request error', err);
                res.sendStatus(501);
            });
        }).on('error', function (err) {
            console.log('something went wrong on the request', err.request.options);
        });

        // handling client error events 
        client.on('error', function (err) {
            console.error('Something went wrong on the client', err);
        });


    } else {
        res.sendStatus(403);
    }
}); // end get search results


router.get('/', (req, res) => { // Start of GET to retrieve favorites from SQL Database.
    if (req.isAuthenticated()) {
        let queryText = `SELECT * FROM favorites
                        WHERE user_id = ${req.user.id}
                        ORDER BY manga_name;`    //User ID is used to determine the current user that is logged on so it pulls their favorites.
        pool.query(queryText)
            .then((result) => {
                res.send(result);
            })
            .catch((err) => {
                console.log('Error making get favorites query', err);
                res.sendStatus(500);
            });
    } else {
        res.sendStatus(403);
    }
}); // end of GET to retrieve favorites from SQL Database

/******************************************/
/*            POST REQUESTS              */
/******************************************/

router.post('/', (req, res) => { //Start post of add new favorites.
    if (req.isAuthenticated()) {
        // console.log('Manga Information', req.body);
        // please see my-manga-tracker.sql for how the table is created.
        // Checking for duplicates per user is done on the said .sql sheet. 
        let queryText = `INSERT INTO favorites (manga_name, manga_id, user_id, manga_image_url, latest_chapter, synopsis, status)
                        VALUES ('${req.body.title}', '${req.body.id}', '${req.user.id}', '${req.body.image}', '${req.body.chapters}', '${req.body.synopsis}', '${req.body.status}');`
        pool.query(queryText)
            .then((result) => {
                res.sendStatus(201);
            })
            .catch((err) => {
                console.log('Error making update query', err);
                res.sendStatus(409);
            });
    } else {
        res.sendStatus(403);
    }
}); // end post of add new favorites.

/******************************************/
/*            PUT REQUESTS              */
/******************************************/

router.put('/', (req, res) => { // Start of PUT to edit last chapter read on the SQL Database.
    if (req.isAuthenticated()) {
        // console.log('This is the req.body for PUT update: ',req.body);
        let queryText;
        if (req.body.hasOwnProperty('newLatestChapter') && req.body.hasOwnProperty('newChapterRead')) {
            queryText = `UPDATE favorites
            SET last_chapter_read = ${req.body.newChapterRead}, latest_chapter = ${req.body.newLatestChapter}
            WHERE user_id = ${req.user.id} AND manga_id = ${req.body.manga_id} ;`    //User ID to determine the user that is logged on so it can edit their favorites manga and not another users. Manga ID instead of name since there can be mangas with the same name but they are different.
        }
        else if (req.body.hasOwnProperty('newLatestChapter')) {
            queryText = `UPDATE favorites
            SET latest_chapter = ${req.body.newLatestChapter}
            WHERE user_id = ${req.user.id} AND manga_id = ${req.body.manga_id} ;`    //User ID to determine the user that is logged on so it can edit their favorites manga and not another users. Manga ID instead of name since there can be mangas with the same name but they are different.
        }
        else if (req.body.hasOwnProperty('newChapterRead')) {
            queryText = `UPDATE favorites
            SET last_chapter_read = ${req.body.newChapterRead}
            WHERE user_id = ${req.user.id} AND manga_id = ${req.body.manga_id} ;`    //User ID to determine the user that is logged on so it can edit their favorites manga and not another users. Manga ID instead of name since there can be mangas with the same name but they are different.
        }
        pool.query(queryText)
            .then((result) => {
                res.sendStatus(200);
            })
            .catch((err) => {
                console.log('Error making get favorites query', err);
                res.sendStatus(500);
            });
    } else {
        res.sendStatus(403);
    }
}); // end of PUT to edit last chapter read on the SQL Database

/******************************************/
/*           DELETE REQUESTS              */
/******************************************/

router.delete('/:mangaId', (req, res) => { // Start of DELETE manga request to the SQL Database.
    if (req.isAuthenticated()) {
        // console.log('This is the req.body for DELETE: ',req.params.mangaId);
        let queryText = `DELETE FROM favorites
                        WHERE user_id = ${req.user.id} AND manga_id = ${req.params.mangaId} ;`    //User ID to determine the user that is logged on so it can delete their target manga and not another users. Manga ID instead of name since there can be mangas with the same name but they are different.
        pool.query(queryText)
            .then((result) => {
                res.sendStatus(200);
            })
            .catch((err) => {
                // console.log('Error making delete favorite query', err);
                res.sendStatus(500);
            });
    } else {
        res.sendStatus(403);
    }
}); // end of DELETE manga request to the SQL Database

/******************************************/
/*           OTHER REQUESTS              */
/******************************************/

/********** PRE LOGIN SEARCH *************/

// ITS BASICALLY COPY PASTING THE CODE BUT THIS WAY THE SEARCH RESULTS PAGE CAN STILL BE AUTHENTICATED. 

router.get('/preLogin/:search', (req, res) => { // Start of search results for M.A.L. API.
        client.get(`https://myanimelist.net/api/manga/search.xml?q=${req.params.search}`, function (data, response) {
            // parsed response body as js object 
            //Adding the .manga.entry directly opens each manga details right away.
            // console.log('data from client get',data);
            if (data.hasOwnProperty('manga')) {
                if (typeof data.manga.entry === "undefined") {
                res.send(data.manga);
                }
                else {
                    res.send(data.manga.entry);
                }
            }
            else {
                res.sendStatus(500);
            }
            // console.log('this is the raw response',response);
            req.on('error', function (err) {
                console.log('request error', err);
                res.sendStatus(501);
            });
        }).on('error', function (err) {
            console.log('something went wrong on the request', err.request.options);
        });

        // handling client error events 
        client.on('error', function (err) {
            console.error('Something went wrong on the client', err);
        });
}); // end get search results


module.exports = router;
