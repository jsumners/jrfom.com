'use strict';
const jrfom = require('laic').laic.jrfom;
const metalsmith = jrfom.get('metalsmith');
const rootPath = jrfom.get('rootPath');
const nmPath = `${rootPath}/node_modules`;

console.log('Copying Bootstrap and jQuery scripts ...');
const copy = require('./plugins/copyPlugin');
metalsmith.use(copy({
  files: {
    'js/bootstrap.js': nmPath + '/bootstrap/dist/js/bootstrap.js',
    'js/jquery.js': nmPath + '/jquery/dist/jquery.js'
  }
}));

console.log('Minifying JavaScript ...');
const uglify = require('metalsmith-uglify');
metalsmith.use(uglify({
  filter: ['js/*.js']
}));