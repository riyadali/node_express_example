var mongoose = require('mongoose');
// Getting an error with mongoose for unknown modifier for $pushAll
// Apparently this problem goes away if you move to mongoose version 5. I couldn't do this because the Yarn
// lockfile prevented me from upgrading mongoose. COuld do this at home at some point (refer to 
// https://medium.com/@drdmason/how-i-resolve-conflicts-in-yarn-lock-7083331b5969
// For now I'm using a workaround recommended here https://github.com/Automattic/mongoose/issues/5924
// mongoose.plugin(schema => { schema.options.usePushEach = true }); --- didn't work
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug');
var User = mongoose.model('User');

var ArticleSchema = new mongoose.Schema({
  slug: {type: String, lowercase: true, unique: true},
  title: String,
  description: String,
  body: String,
  favoritesCount: {type: Number, default: 0},
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  tagList: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// Getting an error with mongoose for unknown modifier for $pushAll
// Apparently this problem goes away if you move to mongoose version 5. I couldn't do this because the Yarn
// lockfile prevented me from upgrading mongoose. COuld do this at home at some point (refer to 
// https://medium.com/@drdmason/how-i-resolve-conflicts-in-yarn-lock-7083331b5969
// For now I'm using a workaround recommended here https://github.com/Automattic/mongoose/issues/5924
}, {timestamps: true, usePushEach: true});

ArticleSchema.plugin(uniqueValidator, {message: 'is already taken'});

ArticleSchema.pre('validate', function(next){
  if(!this.slug)  {
    this.slugify();
  }

  next();
});

ArticleSchema.methods.slugify = function() {
  this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};

ArticleSchema.methods.updateFavoriteCount = function() {
  var article = this;

  return User.count({favorites: {$in: [article._id]}}).then(function(count){
    article.favoritesCount = count;

    return article.save();
  });
};

ArticleSchema.methods.toJSONFor = function(user){
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    favorited: user ? user.isFavorite(this._id) : false,
    favoritesCount: this.favoritesCount,
    author: this.author.toProfileJSONFor(user)
  };
};

mongoose.model('Article', ArticleSchema);
