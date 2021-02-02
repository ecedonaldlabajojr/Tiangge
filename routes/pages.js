const express = require('express');
const router = express.Router();



// Import Page Schema
const Page = require('../models/page');


router.get('/', (rqq, res) => {
    Page.find({}, (err, foundPages) => {
        if (!err) {
            res.render('index', {
                pages: foundPages
            })
        } else {
            console.log(err);
        }
    })
    // res.render("index", {
    //     title: "HOME",
    //     content: "Pages"
    // });
});

module.exports = router;