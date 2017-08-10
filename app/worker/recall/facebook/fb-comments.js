const Fb = require('fb')

module.exports.getComments = (user, postsArr) => {

  /*
   * Module configuration
   */
  Fb.setAccessToken(user.facebook.token)

  /*
   * Promise definitions
   */
  const commentsOfPost = pID => Fb.api(
    pID, { fields: 'comments' }
  )
  const commentForEachPost = pArr => {
    if(Array.isArray(pArr))
      return Promise.all(
        pArr.map(p => commentsOfPost(p.id))
      )
      .then(
        fulfilledArr =>
          Promise.resolve(
            { fb_posts: pArr, fb_comments: fulfilledArr }
          )
      )
    else return console.error(
      `Error in commentForEachPost: pArr = ${JSON.stringify(pArr)}`)
  }

  /*
   * Call definition
   */
  const comms = postsArr =>
    commentForEachPost(postsArr)

  /*
   * Call
   */
  return comms(postsArr)

}
