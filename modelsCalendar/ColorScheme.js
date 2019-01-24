var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug');

var ColorSchemeSchema = new mongoose.Schema({
  slug: {type: String, lowercase: true, unique: true},
  name: {type: String, required: [true, "can't be blank"]}, 
  primary: {type: String, required: [true, "can't be blank"]}, 
  secondary: {type: String, required: [true, "can't be blank"]}, 
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {timestamps: true});

ColorSchemeSchema.index({  
  owner: 1,  
  name: -1  // -1 causes the name to be a secondary field in sort order
}, {
  unique: true
});

getUniqueMessage = function(path) {
  return 'is already taken'
}

ColorSchemeSchema.plugin(uniqueValidator, {message: getUniqueMessage("test")});

ColorSchemeSchema.pre('validate', function(next){
  if(!this.slug)  {
    this.slugify();
  }

  next();
});

ColorSchemeSchema.methods.slugify = function() {
  this.slug = slug(this.name) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};


// Requires population of owner
// user has the person being "followed" or null
ColorSchemeSchema.methods.toJSONFor = function(user){
  if (owner) 
    return {
      id: this._id,
      slug: this.slug,
      name: this.name,
      primary: this.primary,
      secondary: this.secondary,    
      owner: this.owner.toProfileJSONFor(user)
    };
  else
    return {
      id: this._id,
      slug: this.slug,
      name: this.name,
      primary: this.primary,
      secondary: this.secondary
    };
}
  
 
mongoose.model('ColorScheme', ColorSchemeSchema);
