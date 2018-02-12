const express = require('express');
const pool = require('../modules/pool.js');
const router = express.Router();

router.get('/', (req, res) => {

console.log('inside mangarouter get');
res.sendStatus(200);

});

module.exports = router;
