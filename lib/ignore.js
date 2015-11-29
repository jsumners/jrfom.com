'use strict';
const jrfom = require('laic').laic.jrfom;
const metalsmith = jrfom.get('metalsmith');

console.log('Processing files to ignore ...');
const ignore = require('metalsmith-ignore');
metalsmith.use(ignore([
  'LICENSE',
  '.gitignore',
  '.gitkeep'
]));