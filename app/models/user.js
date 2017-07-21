/* * *
 * * *  MODEL: User
 * * */

const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const bcrypt = require('bcrypt-nodejs')
const bcrypt = require('bcrypt')

const userSchema = mongoose.Schema(
   {
     // NOTE: _id: ObjectId("...")
     local: {
       email: { type: String },
       password: { type: String }
     },
     facebook: {
       id: { type: String },
       token: { type: String },
       email: { type: String },
       name: { type: String },
       posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
     },
     twitter: {
       id: { type: String },
       token: { type: String },
       tokenSecret: { type: String },
       displayName: { type: String },
       username: { type: String },
       posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
     },
     google: {
       id: { type: String },
       token: { type: String },
       email: { type: String },
       name: { type: String }
     }
   }
 )

//TODO: async with promises
//// methods
// hash generation
userSchema.methods.generateHash = (plaintextPassword) =>
  bcrypt.hashSync(plaintextPassword, 8)
  // bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)

// check if password valid
userSchema.methods.validPassword = (plaintextPassword, currentUser) => {
  if(bcrypt.compareSync(plaintextPassword, currentUser.local.password))
    return true
  else return false
}
  // bcrypt.compareSync(password, this.local.password)

// create and export model
module.exports = mongoose.model('User', userSchema)
