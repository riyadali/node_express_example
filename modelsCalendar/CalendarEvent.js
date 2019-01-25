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
  
  if (this.endDate) {
    if (this.start > this.end) {
        next(new Error('End Date must be greater than Start Date'));
    } else {
        next();
    }
  }
  
});

CalendarEventSchema.methods.slugify = function() {
  this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};


// Requires population of owner
// user has the person being "followed" or null
// needs work to return all fields
CalendarEventSchema.methods.toJSONFor = function(user){ 
    return {
      id: this._id,
      slug: this.slug,
      title: this.title,       
      owner: this.owner.toProfileJSONFor(user),
      color: this.color.toJSONFor(user)      
    };  
}
  
 
mongoose.model('CalendarEvent', CalendarEventSchema);
