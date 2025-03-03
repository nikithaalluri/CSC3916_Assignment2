/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
*/

require('dotenv').config();
console.log("SECRET_KEY:", process.env.SECRET_KEY);

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //hack
var jwt = require('jsonwebtoken');
var cors = require('cors');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

// Function to return a JSON object with request data
function getJSONObjectForMovieRequirement(req) {
    var json = {
        status: 200,
        headers: req.headers || "No headers",
        key: process.env.UNIQUE_KEY,
        body: req.body || "No body",
        query: req.query || "No query params"
    };
    return json;
}

// Signup Route
router.post('/signup', (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.json({ success: false, msg: 'Please include both username and password to signup.' });
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };

        db.save(newUser); // No duplicate checking
        res.json({ success: true, msg: 'Successfully created new user.' });
    }
});

// Signin Route
router.post('/signin', (req, res) => {
    var user = db.findOne(req.body.username);

    if (!user) {
        res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
    } else {
        if (req.body.password == user.password) {
            var userToken = { id: user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.SECRET_KEY, { expiresIn: '1h' }); // Token expires in 1 hour
            res.json({ success: true, token: 'JWT ' + token });
        } else {
            res.status(401).send({ success: false, msg: 'Authentication failed.' });
        }
    }
});

// Test Collection Routes
router.route('/testcollection')
    .delete(authController.isAuthenticated, (req, res) => {
        console.log(req.body);
        res.status(200).json(getJSONObjectForMovieRequirement(req));
    })
    .put(authJwtController.isAuthenticated, (req, res) => {
        console.log(req.body);
        res.status(200).json(getJSONObjectForMovieRequirement(req));
    });

// Movies Routes
router.route('/movies')
    // GET Method (No Authentication)
    .get((req, res) => {
        var response = {
            status: 200,
            message: "GET movies",
            headers: req.headers,
            query: req.query,
            env: process.env.UNIQUE_KEY
        };
        res.json(response);
    })

    // POST Method (No Authentication)
    .post((req, res) => {
        var response = {
            status: 200,
            message: "movie saved",
            headers: req.headers,
            query: req.query,
            env: process.env.UNIQUE_KEY
        };
        res.json(response);
    })

    // PUT Method (Requires JWT Authentication)
    .put(authJwtController.isAuthenticated, (req, res) => {
        var response = {
            status: 200,
            message: "movie updated",
            headers: req.headers,
            query: req.query,
            env: process.env.UNIQUE_KEY
        };
        res.json(response);
    })

    // DELETE Method (Requires Basic Authentication)
    .delete(authController.isAuthenticated, (req, res) => {
        var response = {
            status: 200,
            message: "movie deleted",
            headers: req.headers,
            query: req.query,
            env: process.env.UNIQUE_KEY
        };
        res.json(response);
    })

    // Handle Unsupported HTTP Methods
    .all((req, res) => {
        res.status(405).json({ message: "HTTP method not supported." });
    });

app.use('/', router);

// Start Server
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});

module.exports = app; // for testing only
