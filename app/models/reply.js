/* * *
 * * *  MODEL: Reply
 * * */

const mongoose = require('mongoose')

const replySchema = mongoose.Schema(
  {
    // NOTE: _id: ObjectId("...")
    data: {},
  }
)

module.exports = mongoose.model('Reply', replySchema)
