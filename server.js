var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// If deployed, use the deloyed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
// connect to the Mongo DB
mongoose.connect(MONGODB_URI);

// Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Routes

// A GET route for scraping the screenrant website
app.get("/scrape", function(req, res) {
    // grabs the body of the html with axios
    axios.get("https://screenrant.com/movie-news/").then(function(response) {
        // load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // grab every h3 within an article tag
        $("article h3").each(function(i, element) {
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
                .then(function(dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function(err) {
                    console.log(err)
                });
        });
        // Send a message to the client
        res.send("Scrape Complete")
    })
})

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    db.Article.find({})
    .then(function(dbArticle) {
        res.json(dbArticle)
     })
    .catch(function(err) {
        res.json(err)
    })
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
    db.Article.find({"_id": req.params.id})
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle)
    })
    .catch(function(err) {
      res.json(err)
    })
  });

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
      db.Note.create(req.body)
      .then(function(dbNote) {
        return db.Article.findOneAndUpdate({_id: req.params.id}, { $set: {note: dbNote._id } }, {new: true});
      })
      .then(function(dbArticle) {
        res.join(dbArticle);
      })
      .catch(function(err) {
        res.json(err)
      })
  });

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });