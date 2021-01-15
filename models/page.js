const mongoose = require('mongoose');

// Page Schema
const pageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: String,
    content: String,
    sorting: Number
})

const Page = new mongoose.model("Page", pageSchema);
module.exports = Page;