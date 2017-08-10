//// google module
const google = require('googleapis')
const plus = google.plus('v1')
//// auth data
const configAuth = require('../../../../config/auth')
const auth = require('./gp-config')
//// obj parser
const gpParser = require('./gp-parser')

module.exports.getActivities = (user, count) => {

  /*
   * Promise definition
   */
  const activitiesList = 
    (user, count) => new Promise(
      (resolve, reject) => {
        plus.activities.list({
          collection: 'public',
          userId: 'me',
          maxResults: count,
          auth: auth.getOauth2Client(user),
          key: configAuth.googleAuth.API_KEY
        }, (err, data) => {
          if(err) reject(err)
          else resolve(data)
      })  
    })
    
  /*
   * Call definition
   */
  const feed = (user, count) =>
    activitiesList(user, count)
      .then(
        fulfilled =>           
          Promise.resolve(
            { googlep_feed: gpParser.parse(fulfilled) }
          )
      ).catch(err => console.error(err))

  /*
   * Call
   */
  return feed(user, count)

}