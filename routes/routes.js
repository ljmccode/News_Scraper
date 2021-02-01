const express = require('express');
const mongoose = require('mongoose');
const router = new express.Router();
const db = require("../models");

const axios = require("axios");
const cheerio = require("cheerio");


// GET /?limit=10&page=1
router.get('/', async (req, res) => {
    let page = req.query.page
    if(!page) {
        page =1 
    }
    const limit = 10
    const articles = await db.Article.find({ "saved": false })
        .limit(parseInt(limit))
        .skip((parseInt(page -1) * limit))
        .exec()
    // console.log("Articles:", articles)
    const articlesObj = {
        article: articles
    }
    res.render("index", articlesObj)
    
})



router.get("/scrape", function (req, res) {
    // grabs the body of the html with axios
    axios.get("https://screenrant.com/movie-news/").then(function (response) {
        // load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // grab every h3 within an article tag
        $("article h3").each(function (i, element) {
            // save an empty result object
            var result = {};

            // add the text and href of every link and save them as properties of result object
            result.title = $(this)
                .children("a")
                .text();
            result.link = "https://www.screenrant.com" + $(this)
                .children("a")
                .attr("href");

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err)
                });
        });
        // Send a message to the client
        res.send("Scrape Complete")
    })
})

// grabs article by id, then updates to saved
router.post("/save/:id", function (req, res) {
    // update article's boolean to true
    db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })
        .then(function (error, data) {
            if (error) {
                console.log(error);
            } else {
                res.send(data)
            }
        });
});

// delete saved article
router.post("/unsave/:id", function (req, res) {
    // update article's boolean to false
    db.Article.findByIdAndUpdate({ "_id": req.params.id }, { "saved": false, "notes": [] })
        .then(function (error, data) {
            if (error) {
                console.log(error);
            } else {
                res.send(data)
            }
        })
})

// Renders articles to handlebars and poplulates with saved articles Route getting saved articles
router.get("/saved", function (req, res) {
    db.Article.find({ "saved": true }, function (error, data) {
        var hbsObject = {
            article: data
        };
        res.render("saved", hbsObject)
    });
})


// grabs all notes for an article
router.get('/grabNotes/:id', function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate('note')
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err)
        })
})


// Make new note
router.post("/newNote/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true })
        })
        .then(function (dbArticle) {
            console.log(dbArticle)
            res.json(dbArticle);
        })
        .catch(function (err) {
            console.log(err)
            res.json(err);
        });
});



module.exports = router