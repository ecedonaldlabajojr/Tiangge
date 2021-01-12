const bodyParser = require('body-parser');
const express = require('express');
const ejs = require('ejs');
const config = require('./config/database');

// Setup mongoose ODM
const mongoose = require('mongoose');
mongoose.connect(config.database);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("We're connected!");
});

const itemSchema = mongoose.Schema({
    _id: {
        type: String,
        require: [true, "ID is required"]
    },
    name: {
        type: String,
        required: [true, "Please enter number name."]
    },
    description: {
        type: String,
        required: [true, "Please enter item description."]
    }
});

const Item = new mongoose.model("Item", itemSchema);


const app = express();
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));





app.get('/', (req, res) => {
    res.render('index', {
        foo: "FOO"
    });
})























const port = 3000;
app.listen(process.env.PORT || port, () => {
    console.log(`Server started at port: ${port}`);
})