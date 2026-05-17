const User = require('./User');
const Post = require('./Post');
const Category = require('./Category');
const Message = require('./Message');
const Tag = require('./Tag');
const Rating = require('./Rating');
const Request = require('./Request');

User.hasMany(Post, { foreignKey: 'user_id' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

Post.belongsToMany(Tag, { through: 'post_tags', foreignKey: 'post_id' });
Tag.belongsToMany(Post, { through: 'post_tags', foreignKey: 'tag_id' });

Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

Rating.belongsTo(User, { foreignKey: 'rated_user_id', as: 'ratedUser' });
Rating.belongsTo(User, { foreignKey: 'rating_user_id', as: 'ratingUser' });
Rating.belongsTo(Post, { foreignKey: 'post_id' });

Request.belongsTo(Post, { foreignKey: 'post_id' });
Request.belongsTo(User, { foreignKey: 'requester_id', as: 'requester' });
Post.hasMany(Request, { foreignKey: 'post_id' });
User.hasMany(Request, { foreignKey: 'requester_id' });

module.exports = { User, Post, Category, Message, Tag, Rating, Request };
