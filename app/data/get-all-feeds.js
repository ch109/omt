const twitterFeedGet = require('./feeds/twitter-feed-get')
const fbFeedGet = require('./feeds/facebook-feed-get')

// DEBUG
const testData = require('./test_data/all_feeds')

module.exports.getFeeds = (user, callback) => {

  /*
   * Define promises
   */
  const getTwitterFeedPromise = (user, count) => new Promise(
    (resolve, reject) => {
      twitterFeedGet.getFeed(user, count, (data) => {
        if(!data) reject(new Error('getTwitterFeedPromise = no tw data'))
        else resolve(data)
      })
    })
  const getFbFeedPromise = (user, count) => new Promise(
    (resolve, reject) => {
        fbFeedGet.getFeed(user, count, (data) => {
          if(!data) reject(new Error('getFbFeedPromise = no fb data'))
          else resolve(data)
      })
    })

  /*
   * Call promises
   */
  Promise.all([
    getTwitterFeedPromise(user, 5),
    getFbFeedPromise(user, 5)
    // NOTE: plug in promises for other social networks
  ])
  .then(
    // NOTE:
    //  process data as array
    //    -> dataArr.map((data) => {...})
    //    -> dataArr.forEach((data) => {...})
    fulfilledArr => callback(fulfilledArr)
    // DEBUG
    // {
    //   const jsonStringData = JSON.stringify(fulfilledArr)
    //   console.log('Saved all feeds: %s', jsonStringData)
    //   return callback(jsonStringData)
    // }
  )
  .catch(error => {
    console.log(error)
  })

  /*
   * DEBUG: Use test data
   */
  // return callback(JSON.stringify(testData))

}
