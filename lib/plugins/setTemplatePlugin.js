'use strict'

let pattern

function findTemplateParser (files, metalsmith, done) {
  for (let fpath in files) {
    if (pattern.test(fpath)) {
      const f = files[fpath]
      f.template = f.template || this.templateName
    }
  }
  done()
}

module.exports = function setTemplatePlugin (config) {
  pattern = new RegExp(config.pattern)
  return findTemplateParser.bind(config)
}
