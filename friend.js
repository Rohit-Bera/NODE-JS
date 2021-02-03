// packages
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const friendSchema = new Schema({
    name: String,
    Age: Number,
    ID:Number,
    Tittle:String,
    Clan : String,
    Tittle1 : String,
    Tittle2 : String
});

const Friend = mongoose.model("Friend",friendSchema);

module.exports = Friend;