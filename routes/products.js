const express = require('express');
const router = express.Router();

// ________________ Get Products Model ________________
const Product = require('../models/products');


// Page Root Route Handler
router.get('/', (req, res) => {
    Product.find({}, (err, foundProducts) => {
        if (err) {
            console.log(err);
        };
        res.render('all_products', {
            products: foundProducts
        });
    })
});


router.get('/:categorySlug', (req, res) => {
    Product.find({
        category: req.params.categorySlug
    }, (err, foundProducts) => {
        if (err) {
            return console.log(err);
        } else {
            console.log(foundProducts);
            res.render('cat_products', {
                products: foundProducts
            })
        }
    });
});

module.exports = router;