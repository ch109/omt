/* * *
 * * *  ROUTES DEFINITION
 * * */

// Dashboard
const dashboardReceiver = require('./worker/recall/receiver')
const getActivePlatforms = require('./worker/info/user-platforms')
const getGridObj = require('./worker/info/dashboard-grid')
// Broadcast
const broadcastController = require('./worker/send/controller')


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
      }
    ))

  //// dashboard
  app.get(
    '/dashboard',
    isLoggedIn,
    (req, res) => {  
      const gridObj = getGridObj(getActivePlatforms(req.user))     
      // init promise
      const dashboardPromise =
        dashboardReceiver.receive(req.user)
      // call promise
      dashboardPromise.then(fulfilled => {        
        // DEBUG
        // console.log(`fulfilled = ${JSON.stringify(fulfilled)}`)        
        res.render(
          'dashboard.ejs',
          {      
            grid: gridObj,
            title: 'Dashboard',
            nav: 'dash',

            fb: fulfilled.hasOwnProperty('fb') ? fulfilled.fb.facebook_feed : undefined,
            tw: fulfilled.hasOwnProperty('tw') ? fulfilled.tw.twitter_feed : undefined,
            gp: fulfilled.hasOwnProperty('gp') ? fulfilled.gp : undefined
          }
        )      
      }).catch(
        // TODO: render error site
        err => console.error(err)
      )
    })

  //// broadcast
  app.get(
    '/broadcast',
    isLoggedIn, // middleware
    (req, res) => res.render(
      'broadcast.ejs',
      {
        platforms: getActivePlatforms(req.user),
        title: 'Make a broadcast',
        nav: 'broadcast',
        message_info: req.flash('info-msg-send'),
        message_error: req.flash('info-msg-error')
      }
    ))

  //// send broadcast
  app.post(
    '/broadcast-send',
    (req, res) => {    
      //DEBUG
      console.log(`req.body = ${JSON.stringify(req.body)}`)
      // init promise
      const broadcastPromise = 
        broadcastController.distribute(req.user, req.body)
      // call promise  
      broadcastPromise.then(fulfilled => {
        //DEBUG
        // console.log(`fulfilled = ${JSON.stringify(fulfilled)}`)
        // TODO: interpret fulfilled-obj
        req.flash('info-msg-send', 'Success!')
        res.redirect('/broadcast')
      }).catch(err => {
        console.error(err)
        req.flash('info-msg-send', 'There was an error.')
        res.redirect('/broadcast')
      })      
    }
  )

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
       { 
         accessType: 'offline', 
         approval_prompt: 'force', 
         scope : [
           'profile', 
           'email', 
           'https://www.googleapis.com/auth/plus.login', 
           'https://www.googleapis.com/auth/plus.me'
         ] 
       }
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
        user.google.refreshToken = undefined
        user.save((err) => res.redirect('/profile'))
      })
}
