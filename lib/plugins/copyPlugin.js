'use strict'
const fs = require('fs')

function copy (files, metalsmith, done) {
  for (let key of Object.keys(this.files)) {
    files[key] = {
      contents: fs.readFileSync(this.files[key]),
      mode: '0644'
    }
  }
  done()
}

module.exports = function copyPlugin (config) {
  return copy.bind(config)
}
