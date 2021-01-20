const express = require('express');
const router = express.Router();
const {
    body,
    validationResult
} = require('express-validator');


// ________________ Get Categories Model ________________
const Category = require('../models/categories');


// ________________ Routes ________________
router.get('/', (req, res) => {
    Category.find({}, (err, categories) => {
        res.render("admin/categories", {
            categories: categories
        })
    })
});



router.get('/add-category', (req, res) => {
    res.render("admin/add_category")
})

router.post('/add-category', [
    body('title').not().isEmpty().withMessage("Please provide a title."),
], (req, res) => {
    // Validate Form for errors
    const errors = validationResult(req);

    //Contains Errors
    let errorArray = [];

    // Check for errors from Form validation
    errors.array().forEach((error) => {
        errorArray.push(String(error.msg));
    })

    Category.findOne({
        title: req.body.title
    }, (err, foundCategory) => {
        if (errorArray.length === 0) {
            if (!err) {
                if (!foundCategory) {
                    slugVal = req.body.title
                    let newCategory = new Category({
                        title: req.body.title,
                        slug: slugVal,
                    });
                    newCategory.save();
                    errorArray.push('Successfully added category.')
                    setLocalsMsg('success', errorArray);
                    res.redirect('/admin/categories/add-category');
                } else {
                    errorArray.push("Category Title Already exists. Try again.");
                    setLocalsMsg('danger', errorArray)
                    res.redirect('/admin/categories/add-category');
                }
            } else {
                console.log(err);
            }
        } else {
            setLocalsMsg('danger', errorArray)
            res.redirect('/admin/categories/add-category');
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

router.get('/edit-category/:categoryId', (req, res) => {
    Category.findById(req.params.categoryId, (err, foundCategory) => {
        if (!err) {
            if (foundCategory) {
                res.render("admin/edit_category", {
                    category: foundCategory
                });
            } else {
                console.log("No Category found.");
            }
        } else {
            console.log(err);
        }
    })
})

router.post('/edit-category/:categoryId', (req, res) => {
    Category.findOneAndUpdate({
        _id: req.params.categoryId
    }, {
        $set: {
            title: req.body.title,
            slug: req.body.title,
        }
    }, (err) => {
        if (!err) {
            req.session.message = {
                type: 'success',
                errorArray: ['Edit successful!']
            }
            res.redirect('/admin/categories');
        }
    });
})


router.get('/delete-category/:categoryId', (req, res) => {
    Category.findByIdAndDelete(req.params.categoryId, (err) => {
        if (err) {
            return console.log(err);
        } else {
            req.session.message = {
                type: 'success',
                errorArray: ['Successfully deleted category.']
            }
            res.redirect('/admin/categories');
        }
    })
});
module.exports = router;