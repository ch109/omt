//// passport strategy
const LocalStrategy = require('passport-local').Strategy
//// data
const User = require('../../../../app/models/user')
// customize
const loginStrategy = new LocalStrategy(
{
  // as specified in userSchema.local
  usernameField: 'email',
  passwordField: 'password',
  // allow to pass back entire request to the callback
  passReqToCallback: true
},
(req, email, password, done) => {
  // find user whose email is same as forms email
  User.findOne(
    { 'local.email': email },
    (err, user) => {
      if(err) return done(err)
      // no user found
      if(!user) return done(
        null,
        false,
        req.flash(
          'loginMessage',
          'No user found.'
        ))
      // user found but wrong password
      if(!user.validPassword(password, user))
        return done(
          null,
          false,
          req.flash(
            'loginMessage',
            'Oops! Wrong password.'
          ))
      // success
      return done(null, user)
    })//findOne
})//LocalStrategy

module.exports = loginStrategy