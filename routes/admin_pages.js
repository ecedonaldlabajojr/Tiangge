const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render("index", {
        title: "ADMIN PAGE",
        content: "Admin Page"
    });
});

router.get('/add-pages', (req, res) => {
    const title = "";
    const slug = "";
    const content = "";
    res.render("admin/add_pages", {
        title: title,
        slug: slug,
        content: content
    })
})

module.exports = router;