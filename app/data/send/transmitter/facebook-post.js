const Fb = require('fb')

module.exports.sendMessage = (user, message) => {

  /*
   * Module configuration
   */
  Fb.setAccessToken(user.facebook.token)

  /*
   * Promise definition
   */
  const sendFb = body =>
    // NOTE: Fb.api() already is a promise.
    Fb.api(
      'me/feed', 'post', { message: body }
    )
    
  /*
   * Call definition
   */
  const send = message =>
    sendFb(message)
      .then(
        fulfilled =>
          Promise.resolve({ success: true, facebook_send: fulfilled })
      )

  /*
   * Call
   */
  return send(message)
}
