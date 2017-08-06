module.exports.parse = (messages) => {

  /*
   * Helper funcs
   */
  const getVideoID = url => url.substring(url.indexOf('?v=')+3, url.indexOf('&'))
  const getVideoUrlPart = url => {
    const re = /\?v=.*&/g
    const extracted = url.match(re)
    const id = getVideoID(extracted[0])
    return id
  }

  /*
   * Parser func
   */
  const doParse = result => {
    let templateObj = {}
    let itemsArr = []
    if(Array.isArray(result)) {
      itemsArr = result
    } else {
      itemsArr = result.items    
    }
    itemsArr.forEach((c, i) => {    
        if(c.verb==='post') {
          templateObj[i] = 
          {
            id: c.id,
            post: {            
              date_time: c.published,
              note: c.object.content
            }
          }
        } else 
        if(c.verb==='share') {
          templateObj[i] = 
          {
            id: c.id,
            shared: {
              date_time: c.published,
              note: c.annotation,
              from: c.object.actor.displayName,
              title: c.object.content
            }
          }
          if(c.object.attachments[0].objectType==='photo') {
            templateObj[i].shared.photo = { img_url: c.object.attachments[0].image.url }
          } else 
          if (c.object.attachments[0].objectType==='article') {
            templateObj[i].shared.article = 
            {
              description: c.object.attachments[0].displayName,
              img_url: c.object.attachments[0].image.url
            }
          } else 
          if (c.object.attachments[0].objectType==='video') {
            templateObj[i].shared.video = 
            {
              description: c.object.attachments[0].displayName,
              content: c.object.attachments[0].content,
              video_id: getVideoID(c.object.attachments[0].url)
            }
          } else console.error(
              `googlep-parser: unknown type for obj.object.attachments[0] = ${c.object.attachments[0].objectType}`)
        } else console.error(`googlep-parser: unknown type for obj.verb = ${c.verb}`)
      
    })
    return templateObj
  }
  
  // Call
  return doParse(messages)
  
}