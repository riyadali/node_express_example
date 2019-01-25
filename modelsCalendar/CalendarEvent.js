var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug');

var CalendarEventSchema = new mongoose.Schema({
  slug: {type: String, lowercase: true, unique: true},
  name: {type: String, required: [true, "can't be blank"]}, 
  primary: {type: String, required: [true, "can't be blank"]}, 
  secondary: {type: String, required: [true, "can't be blank"]}, 
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
  this.slug = slug(this.name) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
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
