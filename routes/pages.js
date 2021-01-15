const express = require('express');
const router = express.Router();


router.get('/', (rqq, res) => {
    res.render("index", {
        title: "HOME",
        content: "Pages"
    });
});

module.exports = router;