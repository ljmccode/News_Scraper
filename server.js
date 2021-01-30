const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const router = require('./routes/routes')

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(router)

const PORT = process.env.PORT

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true, 
  useCreateIndex: true, 
  useFindAndModify: false
})
// Middleware
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Handlebars
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


app.listen(PORT, () => {
  console.log("App running on port " + PORT + "!");
});