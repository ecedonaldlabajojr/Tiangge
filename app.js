require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const ejs = require('ejs');
const config = require('./config/database');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const {
    body,
    validationResult
} = require('express-validator');
const fileUpload = require('express-fileupload');


// _______________________ Initialize App _______________________
const app = express();


app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser('secret'));
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: null,
    }
}));
app.use(fileUpload());

// _______________________ Flash-message middleware _______________________
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});


// _______________________ Setup View Engine to EJS _______________________
app.set('view engine', 'ejs');



// _______________________ Set Router _______________________
const pages = require('./routes/pages');
const adminPages = require('./routes/admin_pages');
const adminCategories = require('./routes/admin_categories');
const adminProducts = require('./routes/admin_products');

app.use('/', pages);
app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);



// _______________________ Setup mongoose ODM _______________________
const mongoose = require('mongoose');
mongoose.connect(config.database, config.dbOptions);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("We're connected to the database!");
});



// _______________________ Setup MongoDB Schema & Model Using Mongoose _______________________
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




const port = 3000;
app.listen(config.PORT || port, () => {
    console.log(`Server started at port: ${port}`);
})