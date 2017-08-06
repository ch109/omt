//// google module
const google = require('googleapis')
const plus = google.plus('v1')
// const OAuth2 = google.auth.OAuth2
const auth = require('./gp-config')
//// auth data
const configAuth = require('../../../../config/auth')


module.exports.getComments = (user, activitiesObj) => {

  /*
   * Module configuration
   */
  // const oauth2Client = new OAuth2(
  //   configAuth.googleAuth.clientID,
  //   configAuth.googleAuth.clientSecret,
  //   configAuth.googleAuth.callbackURL
  // ).setCredentials({
  //   access_token: user.google.token,
  //   refresh_token: user.google.refreshToken
  // })

  /*
   * Promise definitions
   */
  const commentsOfActivity = 
    aID => new Promise(
      (resolve, reject) => {
        plus.comments.list({
          activityId : aID,
          auth: auth.getOauth2Client(user),
          key: configAuth.googleAuth.API_KEY
        }, (err, data) => {
          if(err) reject(err)
          else resolve(data)
        })  
    })
  const commentsForEachActivity = actObj => {
    let promiseArr = []
    for(let i=0; i<Object.keys(actObj).length; i++) {
      promiseArr.push(commentsOfActivity(actObj[i].id))
    }
    if(promiseArr.length>0)
      return Promise.all(promiseArr).then(
        fulfilledArr =>
          Promise.resolve(
            { gp_activities: actObj, gp_comments: fulfilledArr }
          )
      ).catch(err => console.error(err))
    else console.error(`gp-comments ERROR: promiseArr is empty`)
  }
    
  /*
   * Call definition
   */
  const comms = actObj => 
    commentsForEachActivity(actObj) 

  /*
   * Call
   */
  return comms(activitiesObj)

}