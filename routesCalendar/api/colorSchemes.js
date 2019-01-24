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
// I think auth should be required for this one
// you should only be allowed to access color schemes you own or
// the "default" color schemes (with no owner field)
// Also it seems as if the user field is always undefined. In principle this should be set to the logged in user
// This code was modeled after the "Article" schema where the author field corresponds to "owner"
// A check is done to display "following" in the author/owner field. This is set to true if if the user (currently logged id)
// follows the "author" ... but it appears that the user is always null so following would never be set
router.get('/:colorScheme', auth.optional, function(req, res, next) {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.colorScheme.populate('owner').execPopulate()
  ]).then(function(results){
    var user = results[0];    
    return res.json({colorScheme: req.colorScheme.toJSONFor(user)});    
  }).catch(next);
});

router.post('/', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    var colorScheme = new ColorScheme(req.body.colorScheme);

    colorScheme.owner = user;

    return colorScheme.save().then(function(){
      console.log(colorScheme.owner);
      return res.json({colorScheme: colorScheme.toJSONFor(user)});
    });
  }).catch(next);
});

// update article
router.put('/:article', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if(req.article.author._id.toString() === req.payload.id.toString()){
      if(typeof req.body.article.title !== 'undefined'){
        req.article.title = req.body.article.title;
      }

      if(typeof req.body.article.description !== 'undefined'){
        req.article.description = req.body.article.description;
      }

      if(typeof req.body.article.body !== 'undefined'){
        req.article.body = req.body.article.body;
      }

      if(typeof req.body.article.tagList !== 'undefined'){
        req.article.tagList = req.body.article.tagList
      }

      req.article.save().then(function(article){
        return res.json({article: article.toJSONFor(user)});
      }).catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
});

// get all colorSchemes
router.get('/', auth.optional, function(req, res, next) {
  var query = {};
//  var limit = 20;
//  var offset = 0;

//  if(typeof req.query.limit !== 'undefined'){
//    limit = req.query.limit;
//  }

//  if(typeof req.query.offset !== 'undefined'){
//    offset = req.query.offset;
//  }

//  if( typeof req.query.tag !== 'undefined' ){
//    query.tagList = {"$in" : [req.query.tag]};
//  }

  Promise.all([
    req.query.owner ? User.findOne({username: req.query.owner}) : null,
    req.query.favorited ? User.findOne({username: req.query.favorited}) : null
  ]).then(function(results){
    var owner = results[0];
   // the following was copied from articles and not really needed here
   // var favoriter = results[1];

    if(owner){
      query.owner = owner._id;
    }

 //   if(favoriter){
 //     query._id = {$in: favoriter.favorites};
 //   } else if(req.query.favorited){
 //     query._id = {$in: []};
 //  }

    return Promise.all([
      ColorScheme.find(query)
 //       .limit(Number(limit))
 //       .skip(Number(offset))
 //       .sort({createdAt: 'desc'})
        .populate('owner')
        .exec(),
      ColorScheme.count(query).exec(),
      req.payload ? User.findById(req.payload.id) : null,
    ]).then(function(results){
      var colorSchemes = results[0];
      var colorSchemesCount = results[1];
      var user = results[2];

      return res.json({
        colorSchemes: colorSchemes.map(function(colorScheme){
          return colorScheme.toJSONFor(user);
        }),
        colorSchemesCount: colorSchemesCount
      });
    });
  }).catch(next);
});

// delete color scheme
router.delete('/:colorScheme', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    if(req.colorScheme.owner._id.toString() === req.payload.id.toString()){
      return req.colorScheme.remove().then(function(){
        return res.sendStatus(204);
      });
    } else {
      return res.sendStatus(403);
    }
  }).catch(next);
});

module.exports = router;
