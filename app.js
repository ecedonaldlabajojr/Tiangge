require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const ejs = require('ejs');
const config = require('./config/database');
const session = require('express-session');
const {
    body,
    validationResult
} = require('express-validator');

// ========================== Initialize App ==========================
const app = express();


// ========================== Set public folder ==========================
app.use(express.static("public"));


// ========================== Setup View Engine to EJS ==========================
app.set('view engine', 'ejs');


// ========================== Body- Middleware ==========================
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// ========================== Express Session ==========================
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true
    }
}))

// ========================== Setup mongoose ODM ==========================
const mongoose = require('mongoose');
mongoose.connect(config.database, config.dbOptions);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("We're connected to the database!");
});

// ========================== Setup MongoDB Schema & Model Using Mongoose ==========================
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



// ========================== Set Router ==========================
const pages = require('./routes/pages');
const adminPages = require('./routes/admin_pages');

app.use('/', pages);
app.use('/admin/pages', adminPages);


// ========================== Setup Express-Validator on POST request ==========================
app.post(
    '/user',
    // username must be an email
    body('username').isEmail(),
    // password must be at least 5 chars long
    body('password').isLength({
        min: 5
    }),
    (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        User.create({
            username: req.body.username,
            password: req.body.password,
        }).then(user => res.json(user));
    },
);

// // Express Messages Middleware
// app.use(require('connect-flash')());
// app.use(function (req, res, next) {
//     res.locals.messages = require('express-messages')(req, res);
//     next();
// });






















const port = 3000;
app.listen(config.PORT || port, () => {
    console.log(`Server started at port: ${port}`);
})