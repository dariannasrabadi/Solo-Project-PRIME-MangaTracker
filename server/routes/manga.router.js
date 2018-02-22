const express = require('express');
const pool = require('../modules/pool.js');
//Needed to access the REST API of M.A.L.
const Client = require('node-rest-client').Client;
const router = express.Router();
const axios = require('axios')

// Is authenticated in a module middleware. 

//Setting user and password for M.A.L. authentication, need to place in .env file
let options_auth = { user: process.env.MAL_USER, password: process.env.MAL_PASSWORD };

let client = new Client(options_auth);

let lastGenreGrab = [new Date] //Sets the initial Date the server was spun up to be compared in terms of 1 day to see next time to grab the genres.
let genreStorage = [] //Where mangas will be stored.
let oneDay = 24 * 60 * 60 * 1000 // The check if its been a day. 

/******************************************/
/*            GET REQUESTS              */
/******************************************/

router.get('/genres/pull/all/genres', (req, res) => { // Start of pull all genres to be stored from ME API
    if (req.isAuthenticated()) {
        let dateNow = new Date

        if (typeof genreStorage[0] == 'undefined') {
            console.log('Inserting initial manga generated');
            axios.get(`https://www.mangaeden.com/api/list/0`)
                .then(response => {
                    // console.log('This is the response from mangaeden', response.data.manga);
                    console.log('Done grabbing the manga'); //Tested this, there are 17k+ manga to grab. Needs about a min or so to grab it.
                    genreStorage.push(response.data.manga)
                    res.sendStatus(200)
                })
                .catch(err => {
                    console.log('Error getting all mangaeden mangas: ', err);
                    res.sendStatus(500);
                });
        }

        if ((dateNow - lastGenreGrab[0]) > oneDay) {
            console.log('its been more than a day! get new manga list!');
            axios.get(`https://www.mangaeden.com/api/list/0`)
                .then(response => {
                    // console.log('This is the response from mangaeden', response.data.manga);
                    //this will remove the prior one and push the new one. AFTER it retrieves the data.
                    genreStorage.pop()
                    genreStorage.push(response.data.manga)
                    res.sendStatus(200)
                })
                .catch(err => {
                    console.log('Error getting all mangaeden mangas: ', err);
                    res.sendStatus(500);
                });
        }
        else {
            console.log('Has not been a day yet since last mangaGrab', (dateNow - lastGenreGrab[0]));
        }
    } else {
        res.sendStatus(403);
    }
}); //End of pull all genres to be stored from ME API

router.get('/button/random/manga', (req, res) => { // Start of search results for M.A.L. API.
    if (req.isAuthenticated()) {
        console.log('Inside start of spin up a random manga');
        let randomGenreManga = genreStorage[0][Math.floor(Math.random() * genreStorage[0].length)]
        console.log('This is the randomGenreManga: ', randomGenreManga);
        randomGenreManga.t = randomGenreManga.t.replace(/(&.*?\;)/g, '');
        let randomMalSearch = randomGenreManga.t.substring(0, 10)
        randomMalSearch = randomMalSearch.replace(/["-/;-@[-`þ]/g, '');

        console.log('This is the search word for mMAL', randomMalSearch);

        client.get(`https://myanimelist.net/api/manga/search.xml?q=${randomMalSearch}`, function (data, response) {
            if (data.hasOwnProperty('manga')) {
                if (typeof data.manga.entry === "undefined") {
                    res.send(data.manga);
                }
                else {
                    res.send(data.manga.entry);
                }
            }
            else {
                // IF THE SEARCH API FAILS THEN SEND BACK THE GENRE RESULT.
                if (randomGenreManga.im == null) { //Checking if the image from Manga Eden does not exist. then replacing it with a default image.
                    randomGenreManga.im = 'http://www.colorluna.com/wp-content/uploads/2014/03/Oscar-say-Go-Away-in-Sesame-Street-Coloring-Page.jpg' //Will change this to something else. This for now though.
                }
                else {
                    randomGenreManga.im = `https://cdn.mangaeden.com/mangasimg/${randomGenreManga.im}` //Adding the base http tag for the manga images to display on genre results page.
                }

                let mangaToSend = { //Will send back the normal manga results from randomGenreManga so that it will still be a manga. 
                    image: randomGenreManga.im,
                    synopsis: "No Synopsis Provided",
                    title: randomGenreManga.t,
                    chapters: 1, // Since the API doesnt provide it, will hard code 1 since if it exists there is always 1 Chapter.
                }
                res.send(mangaToSend);
            }
            // console.log('this is the raw response',response);
            // req.on('error', function (err) {
            //     console.log('request error', err);
            //     res.sendStatus(501);
            // });
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
});


router.get('/genres/:genre', (req, res) => { // Start of search results for M.A.L. API.
    if (req.isAuthenticated()) {
        let dataToReturn = []
        axios.get(`https://www.mangaeden.com/api/list/0/?p=0&l=1500`).then(response => {
            // console.log('This is the response from mangaeden', response.data.manga);
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


/********** AUTO UPDATE LATEST CHAPTER OF FAVORITES *************/

router.put('/chapters', (req, res) => { // Start of Auto Update latest Chapters of user favorites.
    if (req.isAuthenticated()) {
        // START OF FIRST PROCESS IN AUTO UPDATE LAST CHAPTER
        let queryText = `SELECT * FROM favorites
                        WHERE user_id = ${req.user.id}
                        ORDER BY manga_name;`    //User ID is used to determine the current user that is logged on so it pulls their favorites.
        pool.query(queryText)
            .then((result) => {
                // START OF SECOND PROCESS IN AUTO UPDATE LAST CHAPTER - GOT FAVORITES, WILL NOW CROSS CHECK EACH FAVORITE NAME WITH THE MAL API SEARCH
                for (let i = 0; i < result.rows.length; i++) {
                    // IN FIRST FOR LOOP
                    client.get(`https://myanimelist.net/api/manga/search.xml?q=${result.rows[i].manga_name}`, function (data, response) {
                        if (data.hasOwnProperty('manga')) {
                            if (typeof data.manga.entry === "undefined") { // offchance something happened.
                                console.log('Could not update this manga: ', result.rows[i].manga_name);
                            }
                            else { //This should be the real results of favorite search. 
                                if (Array.isArray(data.manga.entry)) { // If the resulting search is an array.
                                    for (let j = 0; j < data.manga.entry.length; j++) { // START OF SECOND FOR LOOP
                                        // IN FIRST FOR LOOP AND SECOND FORLOOP 
                                        if (data.manga.entry[j].id == result.rows[i].manga_id) {
                                            // console.log('Array manga received and matched a manga!: ', result.rows[i].manga_name, ' & ',result.rows[i].manga_id);
                                            if (data.manga.entry[j].chapters == result.rows[i].latest_chapter || data.manga.entry[j].chapters < result.rows[i].latest_chapter) {
                                                console.log('Skipping this manga since latest chapter saved is ahead or the smae as the api\'s chapter: ', result.rows[i].manga_name);
                                            }
                                            else {
                                                // START OF THIRD PROCESS (A) - UPDATING THE DATABASE WITH NEW CHAPTER.
                                                queryText = `UPDATE favorites
                                                SET latest_chapter = ${data.manga.entry[j].chapters}
                                                WHERE user_id = ${req.user.id} AND manga_id = ${result.rows[i].manga_id} ;`
                                                pool.query(queryText)
                                                    .then((result) => {
                                                        // res.sendStatus(200);
                                                        console.log('Updated latest chapter of: ', data.manga.entry[j].title, ' id: ', data.manga.entry[j].id);
                                                    })
                                                    .catch((err) => {
                                                        console.log('Error updating database with auto update lastest chapter for: ', data.manga.entry[j].title, ' id: ', data.manga.entry[j].id);
                                                        // res.sendStatus(500);
                                                    });
                                            }// END OF THIRD PROCESS (B)
                                        }
                                    } // END OF SECOND FOR LOOP (STILL IN FIRST)
                                }
                                else {
                                    if (data.manga.entry.id == result.rows[i].manga_id) {
                                        // console.log('Single manga received and matched a manga!: ', result.rows[i].manga_name, ' & ',result.rows[i].manga_id);
                                        if (data.manga.entry.chapters == result.rows[i].latest_chapter || data.manga.entry.chapters < result.rows[i].latest_chapter) {
                                            console.log('Skipping this manga since latest chapter saved it ahead of api chapter: ', result.rows[i].manga_name);
                                        }
                                        else {
                                            // START OF THIRD PROCESS (B) - UPDATING THE DATABASE WITH NEW CHAPTER.
                                            queryText = `UPDATE favorites
                                            SET latest_chapter = ${data.manga.entry.chapters}
                                            WHERE user_id = ${req.user.id} AND manga_id = ${result.rows[i].manga_id} ;`
                                            pool.query(queryText)
                                                .then((result) => {
                                                    // res.sendStatus(200);
                                                    console.log('Updated latest chapter of: ', data.manga.entry.title, ' id: ', data.manga.entry.id);
                                                })
                                                .catch((err) => {
                                                    console.log('Error updating database with auto update lastest chapter for: ', data.manga.entry.title, ' id: ', data.manga.entry.id);
                                                    // res.sendStatus(500);
                                                });
                                        }// END OF THIRD PROCESS (B)
                                    }
                                }
                            }  // END OF THIRD PROCESS 
                        }
                        else { // START OF SECOND PROCESS ERROR CHECK
                            // res.sendStatus(500); - Cant send back status now since can only send back once. 
                            console.log('Error performing request on: ', result.rows[i].manga_name);
                            
                        }
                    }).on('error', function (err) {
                        console.log('something went wrong on the request', err.request.options);
                    });

                    // handling client error events 
                    client.on('error', function (err) {
                        console.error('Something went wrong on the client', err);
                    });//  END OF SECOND PROCESS ERROR CHECK

                } // END OF FIRST FOR LOOP & END OF SECOND PROCESS 
                res.sendStatus(200)
            })// END OF FIRST PROCESS IN AUTO UPDATE LAST CHAPTER
            .catch((err) => {// FIRST PROCESS ERROR CHECK
                console.log('Error trying to get favorites for auto update last chapters: ', err);
                res.sendStatus(500);
            });// END OF FIRST PROCESS ERROR CHECK
    } else {
        res.sendStatus(403);
    }
}); // end of Auto Update latest Chapters of user favorites.



module.exports = router;
