const express = require('express');
const router = express.Router();

// Import Page Schema
const Page = require('../models/page');



// Page Root Route Handler
router.get('/', (req, res) => {
    Page.findOne({
        slug: 'Home'
    }, (err, foundPage) => {
        if (err) {
            console.log(err);
        };

        res.render('index', {
            title: foundPage.title,
            content: foundPage.content
        });
    })
});


// Custom Pages Route Handler using Page slug
router.get('/:slug', (req, res) => {
    Page.findOne({
        slug: req.params.slug
    }, (err, foundPage) => {
        if (err) {
            console.log(err);
            res.redirect('/');
        }

        if (foundPage) {
            res.render('index', {
                title: foundPage.title,
                content: foundPage.content
            })
        } else {
            res.redirect('/');
        }
    })
})

module.exports = router;