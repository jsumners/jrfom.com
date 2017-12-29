'use strict'
const jrfom = require('laic').laic.jrfom
const metalsmith = jrfom.get('metalsmith')

console.log('Processing Markdown ...')
const markdown = require('metalsmith-markdown')
const highlightjs = require('highlight.js')
metalsmith.use(markdown({
  highlight: function (code) {
    return highlightjs.highlightAuto(code).value
  }
}))
