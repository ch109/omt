const User = require('../../../../app/models/user')
const configAuth = require('../../../auth')
//// passport strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
// standard strategy
const gpStrategy = new GoogleStrategy(
{
  clientID: configAuth.googleAuth.clientID,
  clientSecret: configAuth.googleAuth.clientSecret,
  callbackURL: configAuth.googleAuth.callbackURL,
  passReqToCallback: true
  // enableProof: true
}, (req, token, refreshToken, profile, done) => {
  // console.log(`\n\tGoogle+ refreshToken = ${refreshToken}`)
  // // get data back from twitter before User.findOne is called
  process.nextTick(() => {
    // user is not already logged in
    if (!req.user) {
      User.findOne(
        { 'google.id': profile.id },
        (err, user) => {
          if(err) return done(err)
          // success
          if(user) {
            // user id but no token: formerly linked user
            if (!user.google.token) {
              // DEBUG
              // console.log('found user id but no token\n'+
              //   JSON.stringify(user)+'\ngoogle returned profile: \n'+
              //   JSON.stringify(profile))
              user.google.token = token
              user.google.refreshToken = refreshToken
              user.google.name = profile.displayName
              user.google.email = profile.emails[0].value
              user.save((err) => {
                if (err) throw err
                return done(null, user)
              })
            }              
            // update token automatically if changed
            if (user.google.token!==token&&token!==undefined) {
              // DEBUG
              console.log(`\n\tGoogle+ CHANGING access_token 
                \n\tfrom\t${user.google.token} \n\tto\t${token}\n`)
              user.google.token = token
              user.save((err) => {
                if (err) throw err
                return done(null, user)
              })
            }
            if (user.google.refreshToken!==refreshToken&&refreshToken!==undefined) {
              // DEBUG
              console.log(`\n\tGoogle+ CHANGING refresh_token
                \n\tfrom\t${user.google.refreshToken} \n\tto\t${refreshToken}\n`)
              user.google.refreshToken = refreshToken
              user.save((err) => {
                if (err) throw err
                return done(null, user)
              })
            }
            // DEBUG
            // console.log('found user\n'+JSON.stringify(user)+
            //   '\ngoogle returned profile: \n'+JSON.stringify(profile))
            return done(null, user)
          }
          // create new user
          else {
            // console.log('created new user\ngoogle returned profile: \n'+
            //   JSON.stringify(profile))
            var freshUser = new User()
            // set google information in user model
            freshUser.google.id = profile.id
            freshUser.google.token = token
            freshUser.google.refreshToken = refreshToken
            freshUser.google.name = profile.displayName
            freshUser.google.email = profile.emails[0].value
            // save user to the database
            freshUser.save((err) => {
              if (err) throw err
              // save success
              return done(null, freshUser)
            })
          }
        })//findOne
      // user exists and is logged in
      } else {
        // DEBUG
        // console.log('pulled user out of session: \n'+
        //   JSON.stringify(req.user))
        // pull user out of session
        const user = req.user
        // update current users twitter credentials
        user.google.id = profile.id
        user.google.token = token
        user.google.refreshToken = refreshToken
        user.google.name = profile.displayName
        user.google.email = profile.emails[0].value
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
})//GoogleStrategy

module.exports = gpStrategy