var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug');

var ColorSchemeSchema = new mongoose.Schema({
  slug: {type: String, lowercase: true, unique: true},
  name: String,
  primary: String,
  secondary: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {timestamps: true});

ColorSchemeSchema.plugin(uniqueValidator, {message: 'is already taken'});

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
ColorSchemeSchema.methods.toJSONFor = function(user){
  return {
    id: this._id,
    slug: this.slug,
    name: this.name,
    primary: this.primary,
    secondary: this.secondary,    
    owner: this.owner.toProfileJSONFor(user)
  };
};

mongoose.model('ColorScheme', ColorSchemeSchema);
