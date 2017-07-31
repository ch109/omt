const fbPost = require('./transmitter/facebook-post')
const twPost = require('./transmitter/twitter-post')

module.exports.distribute = (user, postBody) => {
  
  // TODO:
  //    - splitt twitter messages 
  //    - attachment(s)  
  // 
  // example_data:
  //    body = {
  //      "facebook":"y",
  //      "editor":
  //        {
  //          "ops":
  //           [{"insert":"plain text message"}]
  //        }
  //     }
  
  
  /*
   * Func def
   */
  const getPlatformsArr = postObj => {
    let platforms = []
    if(postObj.facebook==='y') platforms.push('facebook')
    if(postObj.twitter==='y') platforms.push('twitter')
    // if(postObj.googlep==='y') platforms.push('googlep')
    return platforms
  }
  const getPlatformPromise = platformName => {
    let platformPromise
    if(platformName==='facebook') platformPromise = fbPost
    if(platformName==='twitter') platformPromise = twPost
    // if(platformName==='googlep') platformPromise = gpPost
    return platformPromise
  }
  const getMessage = post => {
    const editorObj = JSON.parse(post.editor)
    const msgStr = editorObj.ops[0].insert
    const msgCut = msgStr.substring(0, msgStr.length-1)
    return msgCut
  }
  
  /*
   * Call
   */
  if(postBody===undefined||postBody===null||postBody==={}) 
    return Promise.resolve({ success: false, flash: 'post is empty' })
  
  const platformsArr = getPlatformsArr(postBody)
  const message = getMessage(postBody)  
  //DEBUG
  console.log(`\t::: CONTROLLER ::::`)
  console.log(`\tmessage = ${message}`)
  platformsArr.map(
    (c, i) => console.log(`\tplattform[${i}] = ${c}`))
    
  // distribute message to platforms
  if(message===undefined||message===null||message==={}||message==='')
    return Promise.resolve({ success: false, flash: 'no message specified' })
  if(platformsArr.length<=0) 
    return Promise.resolve({ success: false, flash: 'no platforms specified' })
  if(platformsArr.length===1) {
    const platformName = platformsArr[0]
    const platformPromise = getPlatformPromise(platformName)
    //DEBUG
    console.log(`\tfetching promise for ${platformName}`)
    return platformPromise.sendMessage(user, message)
  }
  if(platformsArr.length>1) {
    let platformsPromiseArr = []
    platformsArr.forEach(platformName => {
      const platformPromise = getPlatformPromise(platformName)
      //DEBUG
      console.log(`\tfetching promise for ${platformName}`)
      platformsPromiseArr.push(platformPromise.sendMessage(user, message))
    })
    //DEBUG
    console.log(`\treturning all promises`)
    return Promise.all(platformsPromiseArr)
  }    
  return Promise.resolve({ success: false, flash: 'unknown error' })
}