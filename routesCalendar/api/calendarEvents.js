var router = require('express').Router();
var mongoose = require('mongoose');
var CalendarEvent = mongoose.model('CalendarEvent');
var User = mongoose.model('User');
var auth = require('../../routes/auth');

// Preload calendarEvent objects on routes with ':calendarEvent'
router.param('calendarEvent', function(req, res, next, slug) {
  CalendarEvent.findOne({ slug: slug})
    .populate('owner')
    .then(function (calendarEvent) {
      if (!calendarEvent) { return res.sendStatus(404); }

      req.calendarEvent = calendarEvent;

      return next();
    }).catch(next);
});

// return a calendarEvent
router.get('/:calendarEvent', auth.optional, function(req, res, next) {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.calendarEvent.populate('owner').execPopulate()
  ]).then(function(results){
    var user = results[0];    
    return res.json({calendarEvent: req.calendarEvent.toJSONFor(user)});    
  }).catch(next);
});

router.post('/', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    var calendarEvent = new calendarEvent(req.body.calendarEvent);

    calendarEvent.owner = user;

    return calendarEvent.save().then(function(){
      console.log(calendarEvent.owner);
      return res.json({calendarEvent: calendarEvent.toJSONFor(user)});
    });
  }).catch(next);
});

// update calendar event
router.put('/:calendarEvent', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if(req.calendarEvent.owner._id.toString() === req.payload.id.toString()){
      if(typeof req.body.calendarEvent.name !== 'undefined'){
        req.calendarEvent.name = req.body.calendarEvent.name;
      }      
      

      req.calendarEvent.save().then(function(calendarEvent){
        return res.json({calendarEvent: calendarEvent.toJSONFor(user)});
      }).catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
});

// get all calendar events
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
    req.query.owner ? User.findById(req.query.owner) : null,
    req.query.favorited ? User.findOne({username: req.query.favorited}) : null
  ]).then(function(results){
    var owner = results[0];
   // the following was copied from articles and not really needed here
   // var favoriter = results[1];

    if(owner){      
      query = {
               '$or' : [ {'owner': {'$exists' : false}},  // allow records with no owner                      
                      {'owner': owner._id}]
              }
     
    }

 //   if(favoriter){
 //     query._id = {$in: favoriter.favorites};
 //   } else if(req.query.favorited){
 //     query._id = {$in: []};
 //  }

    return Promise.all([
      CalendarEvent.find(query)
 //       .limit(Number(limit))
 //       .skip(Number(offset))
 //       .sort({createdAt: 'desc'})
        .populate('owner')
        .exec(),
      CalendarEvent.count(query).exec(),
      req.payload ? User.findById(req.payload.id) : null,
    ]).then(function(results){
      var calendarEvents = results[0];
      var calendarEventsCount = results[1];
      var user = results[2];

      return res.json({
        calendarEvents: calendarEvents.map(function(calendarEvent){
          return calendarEvent.toJSONFor(user);
        }),
        calendarEventsCount: calendarEventsCount
      });
    });
  }).catch(next);
});

// delete calendar event
router.delete('/:calendarEvent', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    if(req.calendarEvent.owner._id.toString() === req.payload.id.toString()){
      return req.calendarEvent.remove().then(function(){
        return res.sendStatus(204);
      });
    } else {
      return res.sendStatus(403);
    }
  }).catch(next);
});

module.exports = router;
