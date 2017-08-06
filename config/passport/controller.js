/* * *
 * * *  PASSPORT CONFIGURATION
 * * */

const signupStrategy = require('./strategies/local/signup')
const loginStrategy = require('./strategies/local/login')
const fbStrategy = require('./strategies/plattforms/facebook')
const twStrategy = require('./strategies/plattforms/twitter')
const gpStrategy = require('./strategies/plattforms/googlep')

const User = require('../../app/models/user')
const configAuth = require('../auth')

module.exports = (passport) => {
  
  //// passport session setup
  // required for persistent login sessions
  //  -> serialize and deserialize user instances to and out of session
  passport.serializeUser(
    (user, done) => done(null, user.id))
  passport.deserializeUser(
    (id, done) => User.findById(
      id, (err, user) => done(err, user)
    ))

  //// local signup
  passport.use('local-signup', signupStrategy)

  //// local login
  passport.use('local-login', loginStrategy)

  //// facebook
  passport.use(fbStrategy)

  //// twitter
  passport.use(twStrategy)

  //// google+
  passport.use(gpStrategy) 

}