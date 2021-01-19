const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please provide category title."]
    },
    slug: String
})

const Category = new mongoose.model("Category", categorySchema);

module.exports = Category;