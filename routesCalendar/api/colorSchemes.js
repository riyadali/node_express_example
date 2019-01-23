var router = require('express').Router();
var mongoose = require('mongoose');
var ColorScheme = mongoose.model('ColorScheme');
var User = mongoose.model('User');
var auth = require('../../routes/auth');

// Preload colorScheme objects on routes with ':colorScheme'
router.param('colorScheme', function(req, res, next, slug) {
  ColorScheme.findOne({ slug: slug})
    .populate('owner')
    .then(function (colorScheme) {
      if (!colorScheme) { return res.sendStatus(404); }

      req.colorScheme = colorScheme;

      return next();
    }).catch(next);
});

// return a colorScheme
router.get('/:colorScheme', auth.optional, function(req, res, next) {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.colorScheme.populate('owner').execPopulate()
  ]).then(function(results){
    var user = results[0];

    return res.json({colorScheme: req.colorScheme.toJSONFor(user)});
  }).catch(next);
});

module.exports = router;
