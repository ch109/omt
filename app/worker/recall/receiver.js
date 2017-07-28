const fbTimeline = require('./facebook/fb-timeline')
const fbComments = require('./facebook/fb-comments')
const fbParser = require('./facebook/fb-parser')
const twTimeline = require('./twitter/tw-timeline')
const twComments = require('./twitter/tw-comments')
const twParser = require('./twitter/tw-parser')


module.exports.receive = user => {

  /*
   * Prms def
   */
   const fbPromise = fbTimeline.getTimeline(user, 5)
     .then(fulfilled =>
       fbComments.getComments(user, fulfilled.facebook_feed)
     )
   const twPromise = twTimeline.getTimeline(user, 5)
     .then(fulfilled =>        
       twComments.getComments(user, fulfilled.twitter_feed)
     )
   
   /*
    * Call
    */
   return Promise.all(
     [
       fbPromise, 
       twPromise
     ]
   )
   .then(fulfilled_allFeeds => {
     return {
       fb: fbParser(fulfilled_allFeeds), 
       tw: twParser(fulfilled_allFeeds)
     }
   })

}
