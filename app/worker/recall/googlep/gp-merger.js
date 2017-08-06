const getRootArr = require('../shared/parser')
const gpParser = require('./gp-parser')

module.exports.merge = resultObj => {
  
  /*
   * Func def
   */
  const getID = str => str.substring(0, str.indexOf('.'))
  const doMerge = (commentArr, parsedObj) => {
    let parsedCpy = parsedObj
    commentArr.forEach(c => {
      for(let j=0; j<Object.keys(parsedObj).length; j++) {
        if(c.items.length>0&&getID(c.items[0].id)===parsedObj[j].id) {      
          parsedCpy[j].comments = gpParser.parse(c.items)      
        } 
      }
    })
    return parsedCpy
  }

  /*
   * Call
   */
  // DEBUG
  console.log(JSON.stringify(resultObj))
  
  const actObj = getRootArr(resultObj, 'gp_activities')
  const commsArr = getRootArr(resultObj, 'gp_comments')
  
  return doMerge(commsArr, actObj)

}