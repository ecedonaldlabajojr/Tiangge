const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: String,
    category: String,
    image: String
});

const Product = new mongoose.model("Product", productSchema);

module.exports = Product;