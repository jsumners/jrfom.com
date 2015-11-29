'use strict';
const jrfom = require('laic').laic.jrfom;
const metalsmith = jrfom.get('metalsmith');

console.log('Parsing date metadata ...');
const parseDate = require('./plugins/parseDatePlugin');
metalsmith.use(parseDate);

console.log('Building permalinks ...');
const permalinks = require('metalsmith-permalinks');
metalsmith.use(permalinks({
  pattern: './pages/:title',
  relative: false
}))
.use(permalinks({
  pattern: './posts/:year/:month/:day/:title',
  relative: false
}));