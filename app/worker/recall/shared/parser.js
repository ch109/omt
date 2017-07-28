//NOTE: usable for all feeds
const getRootArr = (feedObj, keyName) => {
    let result
    feedObj.forEach(f => {
      if(f.hasOwnProperty(keyName))
        result = f[keyName]
    })
    return result
  }

module.exports = getRootArr
