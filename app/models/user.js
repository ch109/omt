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
     },
     twitter: {
       id: { type: String },
       token: { type: String },
       tokenSecret: { type: String },
       displayName: { type: String },
       username: { type: String },
     },
     google: {
       id: { type: String },
       token: { type: String },
       refreshToken: { type: String },
       email: { type: String },
       name: { type: String }
     }
   }
 )

//// methods
// hash generation
userSchema.methods.generateHash = (plaintextPassword) =>
  bcrypt.hashSync(plaintextPassword, 8)

// check if password is valid
userSchema.methods.validPassword = (plaintextPassword, currentUser) => {
  if(bcrypt.compareSync(plaintextPassword, currentUser.local.password))
    return true
  else return false
}

module.exports = mongoose.model('User', userSchema)
