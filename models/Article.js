const mongoose = require("mongoose");
// var Note = require("./Note")

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
const ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    saved: {
        type: Boolean,
        default: false
    },
    // object that store the note id
    // ref prperty links the object id to the note model, 
    // allowing the article to populate with associated note
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

// This creates our model from the above schema, using mongoose's model method
const Article = mongoose.model("Article", ArticleSchema)

module.exports = Article;