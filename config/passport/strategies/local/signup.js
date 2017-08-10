//// passport strategy
const LocalStrategy = require('passport-local').Strategy
//// data
const User = require('../../../../app/models/user')
// customize
const signupStrategy = new LocalStrategy(
{
  // as specified in userSchema.local
  usernameField: 'email',
  passwordField: 'password',
  // allow to pass back entire request to the callback
  passReqToCallback: true
},
(req, email, password, done) => {
  // asynchronous
  process.nextTick(() => {

    // user is not already logged in
    if (!req.user) {
      // find user whose email is same as forms email
      User.findOne(
        { 'local.email': email },
        (err, user) => {
          if(err) return done(err)
          // user already exists
          if(user) {
            return done(
              null,
              false,
              req.flash(
                'signupMessage',
                'That email is already taken.'
              ))
          // create new user
          } else {
            let freshUser = new User()
            // set local credentials
            freshUser.local.email = email
            freshUser.local.password =
              freshUser.generateHash(password)
            // save user to db
            freshUser.save((err) => {
              if(err) throw err
              return done(null, freshUser)
            })
          }//else
        })//findOne

      // user exists and is logged in
      } else {
        // DEBUG
        // console.log('pulled user out of session: \n'+
        //   JSON.stringify(req.user))
        // pull user out of session
        const user = req.user
        // update current users facebook credentials
        user.local.email = email
        user.local.password = user.generateHash(password)
        // DEBUG
        // console.log('updated user: \n'+
        //   JSON.stringify(user))
        // save user to the database
        user.save((err) => {
          if (err) throw err
          // save success
          return done(null, user)
        })
      }

  })//nextTick
})//LocalStrategy
  
module.exports = signupStrategy