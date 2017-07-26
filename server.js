/* * *
 * * *  MAIN ENTRY POINT
 * * */

/*
 * Dependencies
 */
const mongoose = require('mongoose')
const passport = require('passport')
const flash = require('connect-flash')

const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')

const favicon = require('serve-favicon')
const path = require('path')

const app = express()

/*
 * Configuration
 */
require('./config/passport')(passport)
const configDB = require('./config/database')
mongoose.connect(configDB.database)

//// EXPRESS
// log every request to the console
app.use(morgan('dev'))
// // body-parser settings
// parse application/x-www-form-urlencoded (default)
// app.use(bodyParser.urlencoded({ extended: false })) // use querystring library
// support encoded bodies
// NOTE: does not handle multipart bodies!
app.use(bodyParser.urlencoded({ extended: true })) // use qs library
// read cookies (needed for auth)
app.use(cookieParser())
// get information from html forms
app.use(bodyParser.json())
// ejs for templating
app.set('view engine', 'ejs')
// views location
app.set('views', path.join(__dirname, '/public/views'))
// static files location
app.use(express.static(path.join(__dirname, 'public')))
app.use('/static', express.static(path.join(__dirname, 'node_modules')))

//// passport
// session secret
app.use(session(require('./config/secret')()))
app.use(passport.initialize())
// persistent login sessions
app.use(passport.session())
// connect-flash for flash messages stored in session
app.use(flash())

//// other
app.use(favicon(path.join(__dirname, 'favicon.ico')))


/*
 * Routes
 */
require('./app/routes.js')(app, passport)

// routes based on environments
// const env = process.env.NODE_ENV || 'development';
// if ('development' == env) {
//    // configure here
// }


/*
 * Launch
 *    $ sudo service mongod start
 *    $ npm run dev
 */
app.listen(8080)
console.log(
  require('./moebius-ascii.js')+
  '   -= Server listens to 127.0.0.1 on PORT 8080 =-\n')
