const express = require('express');
const router = express.Router();
const {
    body,
    validationResult
} = require('express-validator');


// ________________ Get Pages Model ________________
const Page = require("../models/page");


// ________________ Routes ________________
router.get('/', (req, res) => {
    Page.find({}).sort({
        title: 'asc'
    }).exec((err, pagesFound) => {
        res.render("admin/pages", {
            pages: pagesFound
        });
    });
})

router.get('/add-pages', (req, res) => {
    res.render("admin/add_pages")
})

router.post('/add-pages', [
    body('title').not().isEmpty().withMessage("Please provided a title."),
    body('content', "Content cannot be empty.").not().isEmpty(),
], (req, res) => {
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
                        content: req.body.content,
                        sorting: 100
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

    // Function that takes in 'success/danger' types for Bootstrap alert class,and errorArray to display errors/sucess message on said alert component
    function setLocalsMsg(type, errorArray) {
        req.session.message = {
            type: type,
            errorArray: errorArray
        }
    }
});

router.get('/edit-page/:pageSlug', (req, res) => {
    Page.findOne({
        slug: req.params.pageSlug
    }, (err, foundPage) => {
        if (!err) {
            if (foundPage) {
                res.render("admin/edit_page", {
                    page: foundPage
                });
            } else {
                console.log("No Page found.");
            }
        } else {
            console.log(err);
        }
    })
})

router.post('/edit-page/:pageSlug', (req, res) => {
    Page.findOneAndUpdate({
        _id: req.body.page_id
    }, {
        $set: {
            title: req.body.title,
            slug: req.body.slug,
            content: req.body.content
        }
    }, (err) => {
        if (!err) {
            req.session.message = {
                type: 'success',
                errorArray: ['Edit successful!']
            }
            res.redirect('/admin/pages');
        }
    });
})


router.get('/delete-page/:page_id', (req, res) => {
    Page.findByIdAndDelete(req.params.page_id, (err) => {
        if (err) {
            return console.log(err);
        } else {
            req.session.message = {
                type: 'success',
                errorArray: ['Successfully deleted page.']
            }
            res.redirect('/admin/pages');
        }
    })
});
module.exports = router;