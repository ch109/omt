/* * *
 * * *  MODEL: Post
 * * */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postSchema = mongoose.Schema(
  {
    // NOTE: _id: ObjectId("...")
    _user: { type: Schema.Types.ObjectId, ref: 'User'},
    // new: { type: Boolean },
    data: {},
    replies: [{ type: Schema.Types.ObjectId, ref: 'Reply' }]
  }
)

module.exports = mongoose.model('Post', postSchema)
