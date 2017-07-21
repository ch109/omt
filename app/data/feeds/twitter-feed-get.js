const Twit = require('twit')
const configAuth = require('../../../config/auth')

module.exports.getFeed = (user, count) => {

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
  const statusesUserTimeline =
    (user, count) => new Promise(
       (resolve, reject) => {
         T.get(
           'statuses/user_timeline',
           { user_id: user.twitter.id, count: count },
           (err, data, response) => {
             if(err) reject(err)
             else resolve(data)
        })
     })

  /*
   * Call definition
   */
  const feed = (user, count) =>
    statusesUserTimeline(user, count)
      .then(
        fulfilled =>
          Promise.resolve(
            { twitter_feed: fulfilled }
          )
      )

  /*
   * Call
   */
  return feed(user, count)
}
