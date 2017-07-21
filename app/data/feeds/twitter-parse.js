const getRootArr = require('./all-parse')

// NOTE: just for twitter feeds
const parseFeed = (allFeeds) => {

  /*
   * Helper definitions
   */
   const duplicate = (obj, id) => {
     for(let i=0; i<obj.twitter_feed.length; i++) {
       if(obj.twitter_feed[i].post.id==id)
       return true
     }
     return false
   }
  const merge = (_post, _comm) => {
    let obj = { post: {}, reply: [] }
    let replyObj = {}
    Object.keys(_post).map(k => obj.post[k] = _post[k])
    Object.keys(_comm).map(k => replyObj[k] = _comm[k])
    obj.reply.push(replyObj)
    return obj
  }
  const mergeDuplicate = (obj, id, comm) => {
    for(let i=0; i<obj.twitter_feed.length; i++) {
      if(obj.twitter_feed[i].post.id==id)
        obj.twitter_feed[i].reply.push(comm)
    }
  }
  const compareMerge = (pArr, cArr) => {
    let twObj = { twitter_feed: [] }
    let push = false
    for(let i=0; i<pArr.length; i++) {
      for(let j=0; j<cArr.length; j++) {
        if(cArr[j].in_reply_to_status_id_str==pArr[i].id_str) {
          if(duplicate(twObj, pArr[i].id_str)) {
            mergeDuplicate(twObj, pArr[i].id_str, cArr[j])
          } else {
            twObj.twitter_feed.push(merge(pArr[i], cArr[j]))
          }
          push = true
        }
      }
      if(push) {
        push = false
      } else {
        twObj.twitter_feed.push({ post: pArr[i] })
      }
    }
    return twObj
  }

  /*
   * Call
   */
  const posts = getRootArr(allFeeds, 'tw_posts')
  const comms = getRootArr(allFeeds, 'tw_comments')

  const merged = compareMerge(posts, comms)

  return merged

}

module.exports = parseFeed
