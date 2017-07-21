/* * *
 * * *  ROUTES DEFINITION
 * * */

// const getAllFeeds = require('./data/get-all-feeds')
// const parseFeed = require('./data/feeds/parse-feed')

const twFeedGet = require('./data/feeds/twitter-feed-get')
const twCommsGet = require('./data/feeds/twitter-comments')
const twParseFeed = require('./data/feeds/twitter-parse')
const fbFeedGet = require('./data/feeds/facebook-feed-get')
const fbCommsGet = require('./data/feeds/facebook-comments')
const fbParseFeed = require('./data/feeds/facebook-parse')

// Testdata
const testData = require('./data/test_data/all_feeds')


module.exports = (app, passport) => {

  //// middleware
  const isLoggedIn = (req, res, next) => {
      if(req.isAuthenticated())
        return next()
      res.redirect('/')
  }


  /*
   * Unprotected site sections
   */

  //// home
  app.get(
    '/',
    (req, res) => res.render(
      'index.ejs',
      {
        title: 'Login',
        nav: '',
        locked: true
      }
    ))

  //// logout
  app.get(
    '/logout',
    (req, res) => {
      req.logout()
      res.redirect('/')
    }
  )


/*
 * Protected site sections
 */

  //// profile
  app.get(
    '/profile',
    // middleware
    isLoggedIn,
    (req, res) => res.render(
      'profile.ejs',
      {
        user: req.user,
        title: 'Profile Page',
        nav: 'profile',
        locked: false
      }
    ))

  //// feeds
  app.get(
    '/feeds',
    isLoggedIn,
    (req, res) => {

      // TODO: put in seperate script
      //  -> use just one promise here
      // const fbPromise = fbFeedGet.getFeed(req.user, 5)
      //   .then(fulfilled =>
      //     fbCommsGet.getComms(req.user, fulfilled.facebook_feed)
      //   )
      // const twPromise = twFeedGet.getFeed(req.user, 5)
      //   .then(fulfilled => {
      //     // console.log(`DEBUG tw fulfilled = ${JSON.stringify(fulfilled.twitter_feed)}`)
      //     return twCommsGet.getComms(req.user, fulfilled.twitter_feed)
      //   })
      // Promise.all(
      //   [fbPromise, twPromise]
      // )

      // NOTE: Testdata
      Promise.resolve(testData)

      .then(fulfilled_allFeeds => {
        // console.log(`\nDEBUG fulfilled_allFeeds =\n${JSON.stringify(fulfilled_allFeeds)}`)

        const fbFeeds = fbParseFeed(fulfilled_allFeeds)
        const twFeeds = twParseFeed(fulfilled_allFeeds)

        // console.log(`\nDEBUG fbFeeds =\n${JSON.stringify(fbFeeds)}`)
        console.log(`\nDEBUG twFeeds =\n${JSON.stringify(twFeeds)}`)

        res.render(
          'feeds.ejs',
          {
            user: req.user,
            title: 'All Feeds',
            nav: 'feeds',
            locked: false,

            fb: fbFeeds.facebook_feed,
            tw: twFeeds.twitter_feed
          }
        )
      })
      .catch(err => console.error(err))
    }
  )//get

  /*
   * Authentication
   *  -> User registers
   *  -> User signs in
   */

   //// login
   // form
   app.get(
     '/login',
     // pass in flash data if exists
     (req, res) => res.render(
       'login.ejs',
       {
         message: req.flash('loginMessage'),
         title: 'Login Local Account',
         nav: '',
         locked: true
       }
     ))
   // process form
   app.post(
     '/login',
     passport.authenticate(
       'local-login',
       {
         // secure profile section
         successRedirect: '/profile',
         // error: login page
         failureRedirect: '/login',
         // allow flash messages
         failureFlash: true
       }
     ))

   //// signup
   // form
   app.get(
     '/signup',
     // pass in flash data if exists
     (req, res) => res.render(
       'signup.ejs',
       {
         message: req.flash('signupMessage'),
         title: 'Signup Local Account',
         nav: '',
         locked: true
       }
     ))
   // process form
   app.post(
     '/signup',
     passport.authenticate(
       'local-signup',
       {
         // secure profile section
         successRedirect: '/profile',
         // error: signup page
         failureRedirect: '/signup',
         // allow flash messages
         failureFlash: true
       }
     ))

  //// facebook
  // authentication and login
  app.get(
    '/auth/facebook',
    passport.authenticate(
      'facebook',
      {
        authType: 'rerequest',
        scope: ['public_profile,email,user_posts,publish_actions,read_page_mailboxes']
      }
    ))
  // callback after authentication
  app.get(
    '/auth/facebook/callback',
    passport.authenticate(
      'facebook',
      {
        successRedirect: '/profile',
        failureRedirect: '/'
      }
    ))

  //// twitter
  // authentication and login
  app.get(
    '/auth/twitter',
    passport.authenticate('twitter'))
  // callback after authentication
  app.get(
    '/auth/twitter/callback',
    passport.authenticate(
      'twitter',
      {
        successRedirect: '/profile',
        failureRedirect: '/'
      }
    ))

  //// google
  // authentication and login
   app.get(
     '/auth/google',
     passport.authenticate(
       'google',
       { scope : ['profile', 'email'] }
     ))
   // callback after authentication
   app.get(
     '/auth/google/callback',
     passport.authenticate(
       'google',
        {
          successRedirect: '/profile',
          failureRedirect: '/'
        }
     ))


   /*
    * Authorization
    *   -> User is already logged in
    *   -> User connects to other social account
    *   -> User links accounts
    */

    //// local login
    app.get(
      '/connect/local',
      (req, res) => res.render(
        'connect-local.ejs',
        {
          message: req.flash('loginMessage'),
          title: 'Connect Local Account',
          locked: false,
          nav: ''
        }
      ))
    app.post(
      '/connect/local',
      passport.authenticate(
        'local-signup',
        {
          // secure profile section
          successRedirect: '/profile',
          // error: redirect back to signup page
          failureRedirect: '/connect/local',
          // allow flash messages
          failureFlash: true
        }
      ))

    //// facebook
    // authentication via facebook
    // authorize in passport
    app.get(
      '/connect/facebook',
      passport.authorize(
        'facebook',
        {
          authType: 'rerequest',
          scope: ['email']
        }
      ))
    // callback after authorization
    app.get(
      '/connect/facebook/callback',
      passport.authorize(
        'facebook',
        {
          successRedirect: '/profile',
          failureRedirect: '/'
        }
      ))

    //// twitter
    // authentication via twitter
    // authorize in passport
    app.get(
      '/connect/twitter',
      passport.authorize(
        'twitter',
        { scope : 'email' }
      ))
    // callback after authorization
    app.get(
      '/connect/twitter/callback',
      passport.authorize(
        'twitter',
        {
          successRedirect: '/profile',
          failureRedirect: '/'
        }
      ))

    //// google
    // authentication via google
    // authorize in passport
    app.get(
      '/connect/google',
      passport.authorize(
        'google',
        { scope: ['profile', 'email'] }
      ))
    // callback after authorization
    app.get(
      '/connect/google/callback',
      passport.authorize(
        'google',
        {
          successRedirect: '/profile',
          failureRedirect: '/'
        }
      ))


    /*
     * Unlink accounts
     *   -> account will stay active to reconnect
     */
     // TODO: Write controller for data changes.

    //// local
    // remove email and password
    app.get(
      '/unlink/local',
      (req, res) => {
        const user = req.user
        user.local.email = undefined
        user.local.password = undefined
        user.save((err) => res.redirect('/profile'))
      })

    //// facebook
    // social account: remove token
    app.get(
      '/unlink/facebook',
      (req, res) => {
        const user = req.user
        user.facebook.token = undefined
        user.save((err) => res.redirect('/profile'))
      })

    //// twitter
    // social account: remove token
    app.get(
      '/unlink/twitter',
      (req, res) => {
        const user = req.user
        user.twitter.token = undefined
        user.save((err) => res.redirect('/profile'))
      })

    //// google
    // social account: remove token
    app.get(
      '/unlink/google',
      (req, res) => {
        const user = req.user
        user.google.token = undefined
        user.save((err) => res.redirect('/profile'))
      })
}
