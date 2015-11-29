'use strict';
const jrfom = require('laic').laic.jrfom;
const metalsmith = jrfom.get('metalsmith');

console.log('Compiling templates ...');
const templates = require('metalsmith-templates');
metalsmith.use(templates({
  engine: 'handlebars',
  directory: 'templates'
}));