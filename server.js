// Server Setup variables

const express = require('express'),
    app = express(),
    request = require('request'),
    bodyParser = require('body-parser');

// Server Configuration

app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// ENV 

require('dotenv').config()
const apiKey = process.env.KEY;

// Functions

let results = []

const getMovie = (callback, url) => {
    let results;
    request(url, function (error, response, body) {
        if ((JSON.parse(body)).total_results === 0) {
            results = {
                results: []
            };
        } else {
            results = JSON.parse(body);
        }
        callback(results);
    });
};

const reqOne = link => {
    return new Promise(resolve => {
        request(link, function (error, response, body) {
            if ((JSON.parse(body)).length === 0) {
                resolve([])
            } else {
                resolve(JSON.parse(body));
            }
        });
    })
}

const getAll = (callback, id) => {
    let url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=videos`,
        video = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}&language=en-US`,
        cast = `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}`,
        images = `https://api.themoviedb.org/3/movie/${id}/images?api_key=${apiKey}`;

    let promise1 = new Promise((resolve, reject) => {
        reqOne(url).then(result => resolve(result))
    }),
        promise2 = new Promise((resolve, reject) => {
            reqOne(video).then(result => resolve(result))
        }),
        promise3 = new Promise((resolve, reject) => {
            reqOne(cast).then(result => resolve(result))
        }),
        promise4 = new Promise((resolve, reject) => {
            reqOne(images).then(result => resolve(result))
        });

    Promise.all([promise1, promise2, promise3, promise4]).then((results) => {
        callback(results)
    }).catch(err => console.log(err));
};

// Routes

app.get('/', (req, res) => {
    let url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`;
    getMovie((results) => {
        res.render('index', {
            movieSearch: results
        })
    }, url);
});

app.get('/movies', (req, res) => {
    let movie = req.query.name,
        url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${movie}&page=1&include_adult=false`;
    getMovie((results) => {
        res.render('index', {
            movieSearch: results
        })
    }, url);
});

app.get('/movie/:id', (req, res) => {
    let id = req.params.id;
    getAll((results) => { res.render('movie', { movie: results }) }, id);
});


app.listen(process.env.PORT, () => {
    console.log(`Server Running on port ${process.env.PORT}...`)
});