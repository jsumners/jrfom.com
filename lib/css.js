'use strict'
const jrfom = require('laic').laic.jrfom
const metalsmith = jrfom.get('metalsmith')
const rootPath = jrfom.get('rootPath')
const nmPath = `${rootPath}/node_modules`

// console.log('Compiling LESS ...');
// const less = require('metalsmith-less');
// metalsmith.use(less({
//   pattern: 'styles/*.less'
// }));

console.log('Copying CSS from node modules ...')
const copy = require('./plugins/copyPlugin')
metalsmith.use(copy({
  files: {
    'styles/github.css': nmPath + '/highlight.js/styles/github.css',
    'styles/bootstrap.css': nmPath + '/bootstrap/dist/css/bootstrap.css',
    'styles/bootstrap-theme.css': nmPath + '/bootstrap/dist/css/bootstrap-theme.css'
  }
}))

// Because they are for the Bootstrap CSS I'll just load the fonts here
console.log('Copying Bootstrap fonts ...')
metalsmith.use(copy({
  files: {
    'fonts/glyphicons-halflings-regular.eot':
      nmPath + '/bootstrap/dist/fonts/glyphicons-halflings-regular.eot',
    'fonts/glyphicons-halflings-regular.svg':
      nmPath + '/bootstrap/dist/fonts/glyphicons-halflings-regular.svg',
    'fonts/glyphicons-halflings-regular.ttf':
      nmPath + '/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf',
    'fonts/glyphicons-halflings-regular.woff':
      nmPath + '/bootstrap/dist/fonts/glyphicons-halflings-regular.woff',
    'fonts/glyphicons-halflings-regular.woff2':
      nmPath + '/bootstrap/dist/fonts/glyphicons-halflings-regular.woff2'
  }
}))

console.log('Concatenating CSS files ...')
const concat = require('metalsmith-concat')
metalsmith.use(concat({
  files: [
    // 'styles/reset.css',
    // 'styles/overrides.css',
    'styles/bootstrap.css',
    'styles/bootstrap-theme.css',
    // 'styles/simple-sidebar.css',
    'styles/github.css',
    'styles/local.css'
  ],
  output: 'styles/style.css'
}))

console.log('Minifiying CSS ...')
const cleanCSS = require('metalsmith-clean-css')
metalsmith.use(cleanCSS({
  files: 'styles/style.css'
}))
