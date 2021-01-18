const express = require('express');
const router = express.Router();
const {
    body,
    validationResult
} = require('express-validator');


// Get Pages Model
const Page = require("../models/page");




// Routes
router.get('/', (req, res) => {
    res.render("index", {
        title: "Admin Page",
        content: "Admin Page"
    });
});

router.get('/add-pages', (req, res) => {
    res.render("admin/add_pages")
})

// router.post('/add-pages', [
//         body('title').not().isEmpty().withMessage("Please provided a title."),
//         body('content', "Content cannot be empty.").not().isEmpty(),
//     ],
//     (req, res) => {

//         // Response Object containing {1}Status and {2}Success/Fail array

//         // Validate Form for errors
//         const errors = validationResult(req);

//         // If Slug value is empty, place page Title instead

//         if (!errors.isEmpty()) {} else {}
//         res.redirect('/add-pages');
//     });

router.post('/add-pages', [
    body('title').not().isEmpty().withMessage("Please provided a title."),
    body('content', "Content cannot be empty.").not().isEmpty(),
], (req, res) => {
    console.log(req.body);
    // Validate Form for errors
    const errors = validationResult(req);

    //Contains Errors
    let errorArray = [];

    // Check for errors from Form validation
    errors.array().forEach((error) => {
        errorArray.push(String(error.msg));
    })

    Page.findOne({
        title: req.body.title
    }, (err, foundPage) => {
        if (errorArray.length === 0) {
            if (!err) {
                if (!foundPage) {
                    let slugVal = req.body.slug;
                    if (req.body.slug === "") {
                        slugVal = req.body.title
                    }
                    let newPage = new Page({
                        title: req.body.title,
                        slug: slugVal,
                        content: req.body.content
                    });
                    newPage.save();
                    errorArray.push('Successfully added page.')
                    setLocalsMsg('success', errorArray);
                    res.redirect('/admin/pages/add-pages');
                } else {
                    errorArray.push("Page Title Already exists. Try again.");
                    setLocalsMsg('danger', errorArray)
                    res.redirect('/admin/pages/add-pages');
                }
            } else {
                console.log(err);
            }
        } else {
            setLocalsMsg('danger', errorArray)
            res.redirect('/admin/pages/add-pages');
        }
    });

    // Function that takes in 'success/danger' types for Bootstrap alert class,and errorArray to display on said alert component
    function setLocalsMsg(type, errorArray) {
        req.session.message = {
            type: type,
            errorArray: errorArray
        }
    }

});
module.exports = router;