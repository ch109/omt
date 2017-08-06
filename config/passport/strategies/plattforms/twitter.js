const User = require('../../../../app/models/user')
const configAuth = require('../../../auth')
//// passport strategy
const TwitterStrategy  = require('passport-twitter').Strategy
// standard strategy
const twStrategy = new TwitterStrategy(
{
    consumerKey: configAuth.twitterAuth.consumerKey,
    consumerSecret: configAuth.twitterAuth.consumerSecret,
    callbackURL: configAuth.twitterAuth.callbackURL,
    passReqToCallback: true
    // email: true
    //includeEmail: true // app must be whitelisted
}, (req, token, tokenSecret, profile, done) => {
  // get data back from twitter before User.findOne is called
  process.nextTick(() => {
    // user is not already logged in
    if (!req.user) {
      User.findOne(
        { 'twitter.id': profile.id },
        (err, user) => {
          if(err) return done(err)
          // success
          if(user) {
            // user id but no token: formerly linked user
            if (!user.twitter.token) {
              // DEBUG
              // console.log('found user id but no token\n'+
              //   JSON.stringify(user)+'\ntwitter returned profile: \n'+
              //   JSON.stringify(profile))
              user.twitter.token = token
              user.twitter.tokenSecret = tokenSecret
              user.twitter.username = profile.username
              user.twitter.displayName = profile.displayName
              user.save((err) => {
                if (err) throw err
                return done(null, user)
              })
            }
            // update token automatically if changed
            if (user.twitter.token !== token) {
              // DEBUG
              console.log(`\n\tCHANGING access_token
                \n\tfrom\t${user.twitter.token} \n\tto\t${token}\n`)
              user.twitter.token = token
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
            // console.log('created new user\ntwitter returned profile: \n'+
            //   JSON.stringify(profile))
            var freshUser = new User()
            // set twitter information in user model
            freshUser.twitter.id = profile.id
            freshUser.twitter.token = token
            freshUser.twitter.tokenSecret = tokenSecret
            freshUser.twitter.username = profile.username
            freshUser.twitter.displayName = profile.displayName
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
        user.twitter.id = profile.id
        user.twitter.token = token
        user.twitter.tokenSecret = tokenSecret
        user.twitter.username = profile.username
        user.twitter.displayName = profile.displayName
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
})//TwitterStrategy

module.exports = twStrategy