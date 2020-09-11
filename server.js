var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var hbs = require("handlebars")


var Note = require("./models/Note")
var Article = require("./models/Article")

// require all models
var db = require("./models");

// Initialize Express
var app = express();

// Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

var PORT = process.env.PORT || 3000;
mongoose.Promise = Promise;
// If deployed, use the deloyed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
// connect to the Mongo DB
mongoose.connect(MONGODB_URI);

// Middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Handlebars

var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Routes

// A GET route for scraping the screenrant website
app.get("/", function (req, res) {
  db.Article.find({ "saved": false }, function (error, data) {
    var hbsObject = {
      article: data
    };
    console.log(hbsObject)
    res.render("index", hbsObject)
  });
});

app.get("/scrape", function (req, res) {
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
app.post("/save/:id", function (req, res) {
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
app.post("/unsave/:id", function (req, res) {
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
app.get("/saved", function (req, res) {
  Article.find({ "saved": true }, function (error, data) {
    var hbsObject = {
      article: data
    };
    res.render("saved", hbsObject)
  });
})


// grabs all notes for an article
app.get('/grabNotes/:id', function (req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate('note')
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err)
    })
})


// Make new note
app.post("/newNote/:id", function (req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate( {_id: req.params.id}, {note: dbNote._id}, {new: true})
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

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
