const Twit = require('twit')
// const twt = require('twitter-text')
const configAuth = require('../../../../config/auth')

module.exports.sendMessage = (user, message) => {

  // TODO: splitt message if too big
  
  // const getLength = msg => twt.getTweetLength(msg)
  
  /*
   * Module configuration
   */
  const T = new Twit({
    consumer_key: configAuth.twitterAuth.consumerKey,
    consumer_secret: configAuth.twitterAuth.consumerSecret,
    access_token: user.twitter.token,
    access_token_secret: user.twitter.tokenSecret,
    timeout_ms: 60*1000 // optional
  })

  /*
   * Promise definition
   */
  const sendTw = message => 
    new Promise(
       (resolve, reject) => {
         T.post(
           'statuses/update', { status: message },
           (err, data, response) => {
             if(err) reject(err)
             else resolve(data)
           }
         )
     })

 /*
  * Call definition
  */
 const send = message =>
   sendTw(message)
     .then(
       fulfilled =>
         Promise.resolve({ success: true, twitter_send: fulfilled })
     )

  /*
   * Call
   */
  return send(message)
}