var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Rota App', success: req.session.success, errors: req.session.errors });
  req.session.errors = null;
});

module.exports = router;
