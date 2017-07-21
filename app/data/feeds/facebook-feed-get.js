const Fb = require('fb')
const configAuth = require('../../../config/auth')

module.exports.getFeed = (user, count) => {

  /*
   * Module configuration
   */
  Fb.setAccessToken(user.facebook.token)

  /*
   * Promise definitions
   */
  const feedOfPosts =
    // NOTE:
    //  Fb.api() already is a promise.
    //  GET queries: '/{user-id}/feed', '/{user-id}/posts'
    (user, count) => Fb.api(
      user.facebook.id, { fields: `feed.limit(${count})` }
    )

  /*
   * Helper definition
   */
  const feedGrabData = (feed) => {
    if(!feed.feed.data) console.error(
      `GET fb feed REJECT: Requested data \'feed.feed.data\' is missing.`)
    else return feed.feed.data
  }

  /*
   * Call definition
   */
  const feed = (user, count) =>
    feedOfPosts(user, count)
      .then(
        fulfilled =>
          Promise.resolve(
            { facebook_feed: feedGrabData(fulfilled) }
          )
      )

  /*
   * Call
   */
  return feed(user, count)

}
