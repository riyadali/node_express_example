var mongoose = require('mongoose');
// Getting an error with mongoose for unknown modifier for $pushAll
// Apparently this problem goes away if you move to mongoose version 5. I couldn't do this because the Yarn
// lockfile prevented me from upgrading mongoose. COuld do this at home at some point (refer to 
// https://medium.com/@drdmason/how-i-resolve-conflicts-in-yarn-lock-7083331b5969
// For now I'm using a workaround recommended here https://github.com/Automattic/mongoose/issues/5924
mongoose.plugin(schema => { schema.options.usePushEach = true });

var CommentSchema = new mongoose.Schema({
  body: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' }
}, {timestamps: true});

// Requires population of author
CommentSchema.methods.toJSONFor = function(user){
  return {
    id: this._id,
    body: this.body,
    createdAt: this.createdAt,
    author: this.author.toProfileJSONFor(user)
  };
};

mongoose.model('Comment', CommentSchema);
