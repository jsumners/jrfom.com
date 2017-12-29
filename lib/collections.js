'use strict'
const jrfom = require('laic').laic.jrfom
const metalsmith = jrfom.get('metalsmith')

console.log('Building collections ...')
const collections = require('metalsmith-collections')
metalsmith.use(collections({
  pages: {
    pattern: 'content/pages/*.md',
    reverse: false
  },
  posts: {
    pattern: 'content/posts/*.md',
    sortBy: 'date',
    reverse: true
  }
}))
