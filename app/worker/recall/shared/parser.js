// NOTE: usable for facebook and twitter feeds

const getRootArr = (feedObj, keyName) => {
    let result = []
    // DEBUG
    // console.log(`parser.js: keyName = ${keyName}`)    
    if(Array.isArray(feedObj)) {
      // DEBUG
      // console.log(`parser.js: feedObj.length = ${feedObj.length}`)
      feedObj.forEach(f => {
        // DEBUG
        // console.log(`parser.js: isArray: loop: found property ${keyName}`)
        // console.log(`parser.js: isArray: loop: f = ${JSON.stringify(f)}`)
        // console.log(`parser.js: isArray: loop: f[${keyName}] = ${JSON.stringify(f[keyName])}`)
        if(f.hasOwnProperty(keyName)) {
          // DEBUG
          // console.log(`parser.js: isArray: loop: return f[${keyName}] = ${JSON.stringify(f[keyName])}`)
          if(f[keyName]!==undefined) {
            // DEBUG
            // console.log(`f[${keyName}]!==undefined`)
            result = f[keyName]                      
          } 
        }
      })      
    } else if(feedObj.hasOwnProperty(keyName)) {
      // DEBUG
      // console.log(`parser.js: hasOwnProperty: found property ${keyName}`)
      result = feedObj[keyName]
    } else console.error(`feedObj doesn't meet requirements`)
    return result
  }

module.exports = getRootArr
