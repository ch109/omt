//// google module
const google = require('googleapis')
const plus = google.plus('v1')
const OAuth2 = google.auth.OAuth2
//// auth data
const configAuth = require('../../../../config/auth')

module.exports.getOauth2Client = user => {
  /*
   * G+ Module configuration
   */
  const oauth2Client = new OAuth2(
    configAuth.googleAuth.clientID,
    configAuth.googleAuth.clientSecret,
    configAuth.googleAuth.callbackURL
  )
  oauth2Client.setCredentials({
    access_token: user.google.token,
    refresh_token: user.google.refreshToken
  })
  return oauth2Client
}