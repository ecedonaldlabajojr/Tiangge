const express = require('express');
const router = express.Router();
const {
    body,
    validationResult
} = require('express-validator');
const mkdirp = require('mkdirp')
const fse = require('fs-extra');
const resizeImg = require('resize-img');
const imgExtensionValidate = require('../util/img-extens-validate');


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

router.post('/add-product', [body('name').not().isEmpty().withMessage("Please provide a product name."),
    body('price').isFloat().withMessage("Please provide valid price."),
    body('description').not().isEmpty().withMessage("Please provide product description"),
], (req, res) => {

    // Error array to be passed to Flash Message Middleware
    let errorArray = [];

    // Validate errors using express-validator
    const errors = validationResult(req);


    // Push errors from express-validator to Error-array
    errors.array().forEach((error) => {
        errorArray.push(String(error.msg));
    })


    // Validate image file uploaded if the user uploaded one, or if it is a image-format file
    let imageFileName;
    if (req.files === null) {
        imageFileName = "";
    } else {
        imageFileName = req.files.image.name !== "undefined" ? req.files.image.name : "";
        if (!isImg(imageFileName)) {
            console.log(isImg(imageFileName));
            errorArray.push(["Please provide valid image format."]);
        }
    }

    console.log(errorArray.length);
    // Check if errorArray has no content {1} error from express-validator and {2}from custom Image validator
    if (errorArray.length > 0) {
        req.session.message = {
            type: 'danger',
            errorArray: errorArray
        }
        res.redirect('/admin/products/add-product')
    }
    // PROCEED saving to database if no errors (form submission) was found
    else {
        const product = new Product({
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            category: req.body.category,
            image: imageFileName
        });
        product.save((err) => {
            // if (err) return console.log(err);

            mkdirp(`public/product_images/${product._id}/`).catch(err => {
                return console.log(err);
            }).then(() => {
                mkdirp(`public/product_images/${product._id}/gallery`).catch(err => {
                    return console.log(err);
                })
            }).then(() => {
                mkdirp(`public/product_images/${product._id}/gallery/thumbs`).catch(err => {
                    return console.log(err);
                }).then(() => {

                })
            }).then(() => {
                if (req.files && req.files.length > 0) {
                    if (imageFileName !== "") {
                        let fileImage = req.files.image;
                        console.log(imageFileName);
                        console.log(fileImage)
                        console.log(__dirname);
                        path = "public/product_images/" + product._id + "/" + fileImage.name;


                        fileImage.mv(path, (err) => {
                            if (err) {
                                return console.log(err);
                            }
                        })
                    }
                }
            })




            req.session.message = {
                type: 'success',
                errorArray: ['Successfully added product.']
            }
            // Product has been saved, redirect to add-pages view
            res.redirect('/admin/products/add-product');
        });


    }
});

router.get('/edit-product/:productId', (req, res) => {
    Product.findById(req.params.productId, (err, foundProduct) => {
        if (!err) {
            if (foundProduct) {
                Category.find({}, (err, categories) => {
                    if (err) return console.log(err)
                    else {
                        res.render("admin/edit_product", {
                            product: foundProduct,
                            categories: categories
                        });
                    }
                })
            } else {
                console.log("Product not found.");
            }
        } else {
            console.log(err);
        }
    })
})

router.post('/edit-product/:productId', (req, res) => {
    // Error array to be passed to Flash Message Middleware
    let errorArray = [];

    // Validate errors using express-validator
    const errors = validationResult(req);


    // Push errors from express-validator to Error-array
    errors.array().forEach((error) => {
        errorArray.push(String(error.msg));
    })


    // Validate image file uploaded if the user uploaded one, or if it is a image-format file
    let imageFileName = product.image;

    if (imageFileName !== req.files.image.name) {
        // Do Nothing. person has selected same picture according to image name.
    } else {
        imageFileName = req.files.image.name !== "undefined" ? req.files.image.name : "";
        if (!isImg(imageFileName)) {
            console.log(isImg(imageFileName));
            errorArray.push(["Please provide valid image format."]);
        }
    }

    console.log(errorArray.length);
    // Check if errorArray has no content {1} error from express-validator and {2}from custom Image validator
    if (errorArray.length > 0) {
        req.session.message = {
            type: 'danger',
            errorArray: errorArray
        }
        res.redirect(`/admin/products/edit-product/${product._id}`)
    } else {
        Category.findOneAndUpdate({
            _id: req.params.categoryId
        }, {
            $set: {
                name: req.body.title,
                price: req.body.price,
                description: req.body.title,
                category: req.body.category,
                image: imageFileName
            }
        }, (err) => {
            if (!err) {

                if (req.files && req.files.length > 0) {
                    if (imageFileName !== "") {
                        let fileImage = req.files.image;
                        console.log(imageFileName);
                        console.log(fileImage)
                        console.log(__dirname);
                        path = "public/product_images/" + product._id + "/" + fileImage.name;


                        fileImage.mv(path, (err) => {
                            if (err) {
                                return console.log(err);
                            } else {
                                req.session.message = {
                                    type: 'success',
                                    errorArray: ['Edit successful!']
                                }
                                res.redirect('/admin/products');
                            }
                        })
                    }
                }
            }
        });
    }
})


router.get('/delete-product/:productId', (req, res) => {
    Product.findByIdAndDelete(req.params.productId, (err) => {
        if (err) {
            return console.log(err);
        } else {
            req.session.message = {
                type: 'success',
                errorArray: ['Successfully deleted product.']
            }
            res.redirect('/admin/products');
        }
    })
});

function isImg(imageFileName) {
    var extension = imageFileName.split('.').pop();
    console.log(extension);
    switch (extension) {
        case 'jpg':
            return 'jpg';
        case 'jpeg':
            return 'jpeg';
        case 'png':
            return 'png';
        default:
            return false;
    }
}

// Format numbers to display (thousands) format E.G 1,500 or 12,500.
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



module.exports = router;