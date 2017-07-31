const getActivePlatforms = user => {
  let activePlatforms = []
  if(user.facebook.token) activePlatforms.push('facebook')
  if(user.twitter.token) activePlatforms.push('twitter')
  if(user.google.token) activePlatforms.push('googlep')
  // more platforms to come
  return activePlatforms
}
module.exports = getActivePlatforms