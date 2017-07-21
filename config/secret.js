// This file retrieves the session secret, which is
// located above the root folder of this project.
// If you cloned this project you have to manually
// create it or change this code.

const fs = require('fs')

const fileName = '../../secret.json'

module.exports = () => {
  let secret_config
  try {
    secret_config = require(fileName)
  } catch (err) {
    console.error(err)
  }
  return secret_config
}
// testing something
