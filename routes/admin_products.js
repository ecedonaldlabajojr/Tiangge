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
const fs = require('fs-extra');
const rimraf = require('rimraf');


// ________________ Get Products Model ________________
const Product = require('../models/products');

// ________________ Get Categories Model ________________
const Category = require('../models/categories');


// // ++++++++++++++++++++++++++++++++++++ GET REQUEST PRODUCTS VIEW ++++++++++++++++++++++++++++++++++++
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

// // ++++++++++++++++++++++++++++++++++++ GET REQUEST ADD PRODUCT ++++++++++++++++++++++++++++++++++++

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


// ++++++++++++++++++++++++++++++++++++ POST REQUEST ADD PRODUCT ++++++++++++++++++++++++++++++++++++
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
                if (req.files != null) {
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




// // ++++++++++++++++++++++++++++++++++++ GET REQUEST EDIT PRODUCT ++++++++++++++++++++++++++++++++++++
router.get('/edit-product/:productId', (req, res) => {
    let imageGallery = [];
    Product.findById(req.params.productId, (err, foundProduct) => {
        if (!err) {
            if (foundProduct) {
                Category.find({}, (err, categories) => {
                    if (err) return console.log(err)
                    else {
                        let path = `public/product_images/${req.params.productId}/gallery/thumbs`
                        fs.readdirSync(path).forEach((file) => {
                            imageGallery.push(file);
                        })
                        res.render("admin/edit_product", {
                            product: foundProduct,
                            categories: categories,
                            imageGallery: imageGallery
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

router.post('/product-gallery/:productId', (req, res) => {
    let productImage = req.files.file;
    let productId = req.params.productId;
    let path = `public/product_images/${productId}/gallery/${productImage.name}`;
    let thumbPath = `public/product_images/${productId}/gallery/thumbs/${productImage.name}`;

    productImage.mv(path, (err) => {
        if (err) console.log(err);

        resizeImg(fs.readFileSync(path), {
            width: 100,
            height: 100
        }).then((resizedImg) => {
            fs.writeFileSync(thumbPath, resizedImg);
        })
        res.sendStatus(200);
    })
})


router.get('/delete-gallery/:productId/:imageName', (req, res) => {
    let product_id = req.params.productId;
    let image_name = req.params.imageName;
    let path = `public/product_images/${product_id}/gallery/thumbs/${image_name}`
    // fs.unlinkSync(path, (err) => {
    //     console.log('unlink triggered');
    //     if (err) console.log(err);
    //     else {
    //         res.redirect('/edit-product/:productId');
    //     }
    // });
    fs.unlink(path, (err) => {
        if (err) console.log(err);
        else {
            res.redirect('back');
        }
    });
})


// // ++++++++++++++++++++++++++++++++++++ POST REQUEST EDIT PRODUCT ++++++++++++++++++++++++++++++++++++

router.post('/edit-product/:productId', [body('name').not().isEmpty().withMessage("Please provide a product name."),
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

    let imageFileName;
    if (req.files != null) {
        if (req.files.image.name !== undefined) {
            imageFileName = req.files.image.name;
            if (!isImg(imageFileName)) {
                errorArray.push(['Please provide valid image format.']);
            }
        }
    } else {
        imageFileName = "";
    }

    // Check if errorArray has no content {1} error from express-validator and {2}from custom Image validator
    if (errorArray.length > 0) {
        req.session.message = {
            type: 'danger',
            errorArray: errorArray
        }
        res.redirect(`/admin/products/edit-product/${req.params.productId}`)
    } else {

        Product.findOne({
            _id: req.params.productId
        }, (err, foundProduct) => {
            console.log(foundProduct);
            if (!err) {
                foundProduct.name = req.body.name;
                foundProduct.price = req.body.price;
                foundProduct.description = req.body.description;
                foundProduct.category = req.body.category;


                if (imageFileName !== "") {
                    let fileImage = req.files.image;
                    path = "public/product_images/" + foundProduct._id + "/" + fileImage.name;

                    if (foundProduct.image !== "") {
                        fs.unlink(`public/product_images/${foundProduct._id}/${foundProduct.image}`, (err) => {
                            if (!err) {
                                fileImage.mv(path, (err) => {
                                    if (err) {
                                        return console.log(err);
                                    } else {
                                        req.session.message = {
                                            type: 'success',
                                            errorArray: ['Edit successful!']
                                        }
                                        foundProduct.image = imageFileName;
                                        foundProduct.save();
                                        console.log(imageFileName);
                                        res.redirect('/admin/products');
                                    }
                                })
                            } else console.log(err);
                        })


                    } else {
                        fileImage.mv(path, (err) => {
                            if (err) {
                                return console.log(err);
                            } else {
                                foundProduct.image = imageFileName;
                                foundProduct.save();
                                req.session.message = {
                                    type: 'success',
                                    errorArray: ['Edit successful!']
                                }
                                res.redirect('/admin/products');
                            }
                        })
                    }
                } else {
                    foundProduct.save();
                    req.session.message = {
                        type: 'success',
                        errorArray: ['Edit successful!']
                    }
                    res.redirect('/admin/products');
                }





            }

        })
    }
})



// // ++++++++++++++++++++++++++++++++++++ GET REQUEST DELETE PRODUCT ++++++++++++++++++++++++++++++++++++
router.get('/delete-product/:productId', (req, res) => {
    Product.findByIdAndDelete(req.params.productId, (err) => {
        if (err) {
            return console.log(err);
        } else {
            // fs.unlink(`public/product_images/${req.params.productId}`, err => {
            // if (!err) {
            rimraf(`public/product_images/${req.params.productId}`, () => {
                console.log("Finished deleting");
            })
            req.session.message = {
                type: 'success',
                errorArray: ['Successfully deleted product.']
            }
            res.redirect('/admin/products');
            // } else console.log(err);
            // })
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



// Delete folder non-empty
var deleteFolderRecursive = function (path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

module.exports = router;