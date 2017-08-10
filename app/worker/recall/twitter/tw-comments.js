const Twit = require('twit')
const configAuth = require('../../../../config/auth')

module.exports.getComments = (user, postsArr) => {

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
  const statusesMentionsTimeline =
    pArr => new Promise(
      (resolve, reject) => {
        T.get(
          'statuses/mentions_timeline',
          (err, data, response) => {
            if(err) reject(err)
            else resolve(
              { tw_posts: pArr, tw_comments: data }
            )
       })
    })

  /*
   * Call definition
   */
  const comms = postsArr =>
    statusesMentionsTimeline(postsArr)

  /*
   * Call
   */
  return comms(postsArr)

}
