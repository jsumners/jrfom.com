'use strict'
const jrfom = require('laic').laic.jrfom
const metalsmith = jrfom.get('metalsmith')

console.log('Setting templates ...')
const setTemplate = require('./plugins/setTemplatePlugin')
metalsmith.use(setTemplate({
  pattern: 'posts',
  templateName: 'page.hbt'
}))
