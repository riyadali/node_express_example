var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug');

var CalendarEventSchema = new mongoose.Schema({
  slug: {type: String, lowercase: true, unique: true},
  title: {type: String, required: [true, "can't be blank"]}, 
  start: {type: Date, required: [true, "can't be blank"]},
  end: Date,
  allDay: Boolean,
  description: String,
  location: String,
  address: String,
  contact: String,
  cost: String,
  link: String,
  draggable: Boolean,
  resizable: { type: {
                      beforeStart: Boolean,
                      afterEnd: Boolean,
                      }   
              },   
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  color: {type: mongoose.Schema.Types.ObjectId, ref: 'ColorScheme', required: [true, "can't be blank"]},
}, {timestamps: true});


CalendarEventSchema.plugin(uniqueValidator, {message: 'is already taken'});

CalendarEventSchema.pre('validate', function(next){
  if(!this.slug)  {
    this.slugify();
  }
  
  if (this.end) {
    if (this.start > this.end) {
        next(new Error('End Date must be greater than Start Date'));
    } else {
        next();
    }
  } else {
    next();
  }
  
});

CalendarEventSchema.methods.slugify = function() {
  this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};


// Requires population of owner
// user has the person being "followed" or null
// needs work to return all fields
CalendarEventSchema.methods.toJSONFor = function(user){ 
   results = {
      id: this._id,
      slug: this.slug,
      title: this.title,       
      owner: this.owner.toProfileJSONFor(user),
      color: this.color.toJSONFor(user)      
    }; 
    
    if(typeof this.description !== 'undefined'){
      results.description = this.description;
    } 
    if(typeof this.start !== 'undefined'){
      results.start = this.start;
    } 
    if(typeof this.end !== 'undefined'){
      results.end = this.end;
    } 
    if(typeof this.location !== 'undefined'){
      results.location = this.location;
    } 
    if(typeof this.address !== 'undefined'){
      results.address = this.address;
    } 
    if(typeof this.cost !== 'undefined'){
      results.cost = this.cost;
    }
    if(typeof this.contact !== 'undefined'){
      results.contact = this.contact;
    }
    if(typeof this.link !== 'undefined'){
      results.link = this.link;
    }
    if(typeof this.draggable !== 'undefined'){
      results.draggable = this.draggable;
    } 
    if(typeof this.resizable !== 'undefined'){
      results.resizable = this.resizable;
    } 
    
    return results;
}
  
 
mongoose.model('CalendarEvent', CalendarEventSchema);
