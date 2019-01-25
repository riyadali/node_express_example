var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug');

var CalendarEventSchema = new mongoose.Schema({
  slug: {type: String, lowercase: true, unique: true},
  title: {type: String, required: [true, "can't be blank"]},
  color: {type: String, required: [true, "can't be blank"]},
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
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {timestamps: true});


CalendarEventSchema.plugin(uniqueValidator, {message: 'is already taken'});

CalendarEventSchema.pre('validate', function(next){
  if(!this.slug)  {
    this.slugify();
  }

  next();
});

CalendarEventSchema.methods.slugify = function() {
  this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};


// Requires population of owner
// user has the person being "followed" or null
CalendarEventSchema.methods.toJSONFor = function(user){ 
    return {
      id: this._id,
      slug: this.slug,
      name: this.name,
      primary: this.primary,
      secondary: this.secondary,    
      owner: this.owner.toProfileJSONFor(user)
    };  
}
  
 
mongoose.model('CalendarEventScheme', CalendarEventSchema);
