const User = require('../../../../app/models/user')
const configAuth = require('../../../auth')
//// passport strategy
const FacebookStrategy = require('passport-facebook').Strategy
// standard strategy
const fbStrategy = new FacebookStrategy(
{
  // specified in `./auth.js`
  clientID: configAuth.facebookAuth.clientID,
  clientSecret: configAuth.facebookAuth.clientSecret,
  callbackURL: configAuth.facebookAuth.callbackURL,
  profileFields: ['displayName', 'first_name', 'last_name', 'email'],
  enableProof: true,
  // allow to pass in the req from our route
  //  -> check if a user is logged in or not
  passReqToCallback: true
},
// facebook will send back token and profile
(req, token, refreshToken, profile, done) => {
  // get data back from facebook before User.findOne is called
  process.nextTick(() => {

    // user is not already logged in
    if (!req.user) {
      // find user whose email is same as forms email
      User.findOne(
        { 'facebook.id': profile.id },
        (err, user) => {
          if(err) return done(err)
          // success
          if(user) {
            // user id but no token: formerly linked user
            if (!user.facebook.token) {
              // DEBUG
              // console.log('found user id but no token\n'+
              //   JSON.stringify(user)+'\nfb returned profile: \n'+
              //   JSON.stringify(profile))
              user.facebook.token = token
              user.facebook.name = profile.displayName
              // user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName
              user.facebook.email = profile.emails[0].value
              user.save((err) => {
                if (err) throw err
                return done(null, user)
              })
            }
            // update token automatically if changed
            if (user.facebook.token !== token) {
              // DEBUG
              console.log(`\n\tCHANGING access_token
                \n\tfrom\t${user.facebook.token} \n\tto\t${token}\n`)
              user.facebook.token = token
              user.save((err) => {
                if (err) throw err
                return done(null, user)
              })
            }
            // DEBUG
            // console.log('found user\n'+JSON.stringify(user)+
            //   '\nfb returned profile: \n'+JSON.stringify(profile))
            return done(null, user)
          }
          // create new user
          else {
            // DEBUG
            // console.log('create new user\nfb returned profile: \n'+
            //   JSON.stringify(profile))
            var freshUser = new User()
            // set facebook information in user model
            freshUser.facebook.id = profile.id
            freshUser.facebook.token = token
            freshUser.facebook.name = profile.displayName
            //freshUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName
            // facebook can return multiple emails
            freshUser.facebook.email = profile.emails[0].value
            // DEBUG
            // console.log('created new user: \n'+
            //   JSON.stringify(freshUser))
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
        // update current users facebook credentials
        user.facebook.id = profile.id
        user.facebook.token = token
        user.facebook.name = profile.displayName
        // user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName
        user.facebook.email = profile.emails[0].value
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
})//FacebookStrategy

module.exports = fbStrategy