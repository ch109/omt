/*
 * Calculate dashboard grid  
 */
const getGridObj = platforms => {
  const pCount = platforms.length
  if(pCount<1) return { total: pCount, rows: { 1: [], number: 0, columns: 0 }, tailRow: { 1: [], number: 0, columns: 0 } }
  else if((pCount-4)<0) return { total: pCount, rows: { 1: platforms, number: 1, columns: pCount }, tailRow: { 1: [], number: 0, columns: 0 } }
  else if(pCount>=4) {
    if(pCount%4===0) {
      let gridObj = { total: pCount, rows: { number: Math.floor(pCount/4), columns: 4 }, tailRow: { 1: [], number: 0, columns: 0 } }      
      let rCount = 1    
      for(let i=0; i<pCount; i++) {
        if((i+1)%4===0) {
          gridObj.rows[rCount] = platforms.slice(i-3, i+1)
          rCount += 1
        } 
      }
      return gridObj
    } else {
      let gridObj = { total: pCount, rows: { number: Math.floor(pCount/3), columns: 3 }, tailRow: { 1: [], number: (pCount%3===0 ? 0 : 1), columns: (pCount%3) } }
      let rCount = 1    
      for(let i=0; i<pCount; i++) {
        if((i+1)%3===0) {
          gridObj.rows[rCount] = platforms.slice(i-2, i+1)
          rCount += 1
        } 
      }
      if(pCount%3!==0) {
        gridObj.tailRow['1'] = platforms.slice((platforms.length-(pCount%3)), platforms.length+1)
      }
      return gridObj
    }    
  }
}
module.exports = getGridObj