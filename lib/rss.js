'use strict'
const jrfom = require('laic').laic.jrfom
const metalsmith = jrfom.get('metalsmith')

console.log('Building RSS feed ...')
const feed = require('metalsmith-feed')
metalsmith.use(feed({
  collection: 'posts'
}))
