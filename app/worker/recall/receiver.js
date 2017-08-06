const fbTimeline = require('./facebook/fb-timeline')
const fbComments = require('./facebook/fb-comments')
const fbParser = require('./facebook/fb-parser')
const twTimeline = require('./twitter/tw-timeline')
const twComments = require('./twitter/tw-comments')
const twParser = require('./twitter/tw-parser')
const gpActivities = require('./googlep/gp-activities')
const gpComments = require('./googlep/gp-comments')
const gpMerger = require('./googlep/gp-merger')

const getActivePlatforms = require('../info/user-platforms')


module.exports.receive = user => {
  
  /*
   * Prms def
   */
   const getPlatformPromise = platformName => {
     if(platformName==='facebook') {
       const fbPromise = fbTimeline.getTimeline(user, 5)
         .then(fulfilled =>
           fbComments.getComments(user, fulfilled.facebook_feed)
         )
       return fbPromise
     }
     if(platformName==='twitter') {
       const twPromise = twTimeline.getTimeline(user, 5)
         .then(fulfilled =>        
           twComments.getComments(user, fulfilled.twitter_feed)
         )
       return twPromise
     }
     if(platformName==='googlep') {
       const gpPromise = gpActivities.getActivities(user, 5)
         .then(fulfilled =>        
           gpComments.getComments(user, fulfilled.googlep_feed)
         )
       return gpPromise
     }
   }
   
   /*
   * Func def
   */   
   const getPlatformParserObj = (platformsArr, fullfilled) => {
     let platformParserObj = {}
     platformsArr.forEach(platformName => {
       if(platformName==='facebook') 
         platformParserObj.fb = fbParser(fullfilled)
       if(platformName==='twitter') 
         platformParserObj.tw = twParser(fullfilled)
       if(platformName==='googlep') 
         platformParserObj.gp = gpMerger.merge(fullfilled)     
     })
     // DEBUG
     console.log(`platformParserObj = ${JSON.stringify(platformParserObj)}`)
     return platformParserObj
   }
   
  /*
   * Call
   */   
  const platformsArr = getActivePlatforms(user)
  // DEBUG
  console.log(`platformsArr = ${platformsArr}`)
  if(platformsArr.length<=0) 
    return Promise.resolve({ success: false, flash: 'no platforms specified' })
  else if(platformsArr.length===1) {
     const platformName = platformsArr[0]
     const platformPromise = getPlatformPromise(platformName)
     return platformPromise.then(fullfilled => {
       // DEBUG
      //  console.log(`platformsArr.length===1\n
      //    fullfilled = ${JSON.stringify(fullfilled)}`)
       const templateDataObj = getPlatformParserObj(platformsArr, fullfilled)      
       return templateDataObj
     })
  }
  if(platformsArr.length>1) {
    let promiseArr = []
    platformsArr.forEach(c => {
      // DEBUG
      console.log(`searching promise for ${c}`)
      if(getPlatformPromise(c)!==undefined)
        // DEBUG
        console.log(`pushing promise for ${c} in promiseArr`)
        promiseArr.push(getPlatformPromise(c))
    })
    // DEBUG
    console.log(`promiseArr.length = ${promiseArr.length}`)  
    return Promise.all(promiseArr).then(
      fulfilled_all => { 
        // DEBUG
        console.log(`platformsArr.length>1\n
          fulfilled_all = ${JSON.stringify(fulfilled_all)}`)
        const templateDataObj = getPlatformParserObj(platformsArr, fulfilled_all)      
        return templateDataObj
      }
    ).catch(err => console.error(err))    
  } else console.error(`recall-receiver: unknown error`)
  
  // // DEPRECATED: 
  // 
  //  return Promise.all(
  //    [
  //      fbPromise, 
  //      twPromise
  //    ]
  //  )
  //  .then(fulfilled_allFeeds => {
  //    return {
  //      fb: fbParser(fulfilled_allFeeds), 
  //      tw: twParser(fulfilled_allFeeds)
  //    }
  //  })
}
