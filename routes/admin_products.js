const express = require('express');
const router = express.Router();
const {
    body,
    validationResult
} = require('express-validator');
const mkdirp = require('mkdirp')
const fse = require('fs-extra');
const resizeImg = require('resize-img');


// ________________ Get Products Model ________________
const Product = require('../models/products');

// ________________ Get Categories Model ________________
const Category = require('../models/categories');


// ________________ Routes ________________
router.get('/', (req, res) => {
    let productCount;
    Product.count({}, (err, count) => {
        productCount = count;
    })

    Product.find({}, (err, products) => {
        if (!err) {
            res.render("admin/products", {
                products: products,
                productCount: productCount
            })
        } else {
            console.log(err);
        }
    })
});



router.get('/add-product', (req, res) => {
    Category.find({}, (err, categories) => {
        if (!err) {
            res.render("admin/add_product", {
                categories: categories
            })
        } else {
            console.log(err);
        }
    })
})

router.post('/add-product', [
    body('title').not().isEmpty().withMessage("Please provide a title."),
    body('price').isFloat().withMessage("Please provide valid price."),
    body('description').not().isEmpty().withMessage("Please provide product description"),
    body('image').custom(() => {
        let fileName = (typeof (req.files.image) !== "undefined") ? req.files.image.name : "";

        isImg(fileName);
    }).withMessage("Please provide image file format.")
], (req, res) => {
    // Validate Form for errors
    const errors = validationResult(req);

    //     //Contains Errors
    //     let errorArray = [];

    //     // Check for errors from Form validation
    //     errors.array().forEach((error) => {
    //         errorArray.push(String(error.msg));
    //     })

    //     Category.findOne({
    //         title: req.body.title
    //     }, (err, foundCategory) => {
    //         if (errorArray.length === 0) {
    //             if (!err) {
    //                 if (!foundCategory) {
    //                     slugVal = req.body.title
    //                     let newCategory = new Category({
    //                         title: req.body.title,
    //                         slug: slugVal,
    //                     });
    //                     newCategory.save();
    //                     errorArray.push('Successfully added category.')
    //                     setLocalsMsg('success', errorArray);
    //                     res.redirect('/admin/categories/add-category');
    //                 } else {
    //                     errorArray.push("Category Title Already exists. Try again.");
    //                     setLocalsMsg('danger', errorArray)
    //                     res.redirect('/admin/categories/add-category');
    //                 }
    //             } else {
    //                 console.log(err);
    //             }
    //         } else {
    //             setLocalsMsg('danger', errorArray)
    //             res.redirect('/admin/categories/add-category');
    //         }
    //     });

    //     // Function that takes in 'success/danger' types for Bootstrap alert class,and errorArray to display errors/sucess message on said alert component
    //     function setLocalsMsg(type, errorArray) {
    //         req.session.message = {
    //             type: type,
    //             errorArray: errorArray
    //         }
    // }
});

// router.get('/edit-category/:categoryId', (req, res) => {
//     Category.findById(req.params.categoryId, (err, foundCategory) => {
//         if (!err) {
//             if (foundCategory) {
//                 res.render("admin/edit_category", {
//                     category: foundCategory
//                 });
//             } else {
//                 console.log("No Category found.");
//             }
//         } else {
//             console.log(err);
//         }
//     })
// })

// router.post('/edit-category/:categoryId', (req, res) => {
//     Category.findOneAndUpdate({
//         _id: req.params.categoryId
//     }, {
//         $set: {
//             title: req.body.title,
//             slug: req.body.title,
//         }
//     }, (err) => {
//         if (!err) {
//             req.session.message = {
//                 type: 'success',
//                 errorArray: ['Edit successful!']
//             }
//             res.redirect('/admin/categories');
//         }
//     });
// })


// router.get('/delete-category/:categoryId', (req, res) => {
//     Category.findByIdAndDelete(req.params.categoryId, (err) => {
//         if (err) {
//             return console.log(err);
//         } else {
//             req.session.message = {
//                 type: 'success',
//                 errorArray: ['Successfully deleted category.']
//             }
//             res.redirect('/admin/categories');
//         }
//     })
// });


// _______________________ Custom Validator for checking if uploaded file is image _______________________
function isImg(filename) {
    var extension = (path.extname(filename)).toLowerCase();
    switch (extension) {
        case '.jpg':
            return '.jpg';
        case '.jpeg':
            return '.jpeg';
        case '.png':
            return '.png';
        default:
            return false;
    }
}
module.exports = router;