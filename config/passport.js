/* * *
 * * *  PASSPORT CONFIGURATION
 * * */

//// passport strategies
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const TwitterStrategy  = require('passport-twitter').Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

const User = require('../app/models/user')
const configAuth = require('./auth')

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
  // customized strategy
  passport.use(
    'local-signup',
    new LocalStrategy(
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
  )//use

  //// local login
  // customized strategy
  passport.use(
    'local-login',
    new LocalStrategy(
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
  )//use

  //// facebook
  // standard strategy
  passport.use(
    new FacebookStrategy(
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
  )//use

  //// twitter
  // standard strategy
  passport.use(new TwitterStrategy(
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
  )//use

  //// google
  // standard strategy
  passport.use(new GoogleStrategy(
    {
      clientID: configAuth.googleAuth.clientID,
      clientSecret: configAuth.googleAuth.clientSecret,
      callbackURL: configAuth.googleAuth.callbackURL,
      passReqToCallback: true
      // enableProof: true
    }, (req, token, refreshToken, profile, done) => {
      // get data back from twitter before User.findOne is called
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
                  user.google.name = profile.displayName
                  user.google.email = profile.emails[0].value
                  user.save((err) => {
                    if (err) throw err
                    return done(null, user)
                  })
                }
                // update token automatically if changed
                if (user.google.token !== token) {
                  // DEBUG
                  console.log(`\n\tCHANGING access_token
                    \n\tfrom\t${user.google.token} \n\tto\t${token}\n`)
                  user.google.token = token
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
  )//use

}//module.exports
