const getRootArr = require('../shared/parser')

// NOTE: just for facebook feeds
const parseFeed = (allFeeds) => {

  /*
   * Helper definitions
   */
  const merge = (post, comm) => {
    // NOTE: probably overrites an id somewhere...
    let obj = {}
    Object.keys(post).map(k => obj[k] = post[k])
    Object.keys(comm).map(k => obj[k] = comm[k])
    return obj
  }
  const compareMerge = (pArr, cArr) => {
    let fbObj = { facebook_feed: [] }
    for(let i=0; i<pArr.length; i++) {
      for(let j=0; j<cArr.length; j++) {
        if(cArr[j].id==pArr[i].id) {
          if(cArr[j].hasOwnProperty('comments'))
            fbObj.facebook_feed.push(merge(pArr[i], cArr[j]))
          else
            fbObj.facebook_feed.push(pArr[i])
        }
      }
    }
    return fbObj
  }

  /*
   * Call
   */
  const posts = getRootArr(allFeeds, 'fb_posts')
  // DEBUG
  // console.log(`fb-parser.js: posts = ${JSON.stringify(posts)}`)
  const comms = getRootArr(allFeeds, 'fb_comments')
  // DEBUG
  // console.log(`fb-parser.js: comms = ${JSON.stringify(comms)}`)
  
  const merged = compareMerge(posts, comms)

  return merged

}

module.exports = parseFeed
