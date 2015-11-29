'use strict';

const laic = require('laic').laic;
const jrfom = laic.addNamespace('jrfom');
jrfom.register('rootPath', __dirname);

require('./lib/handlebars');

const Metalsmith = require('metalsmith');
const debug = require('metalsmith-debug');
const metalsmith = new Metalsmith(__dirname);
jrfom.register('metalsmith', metalsmith);
metalsmith.source('./src').destination('./build').use(debug());

const define = require('metalsmith-define');
metalsmith.use(define({
  site: {
    title: 'Room Full Of Mirrors',
    tagline: '... and all I could see was me',
    url: 'http://jrfom.com/',
    author: 'James Sumners'
  }
}));

// Instead of using one long as hell chain, we break up the use calls
// into groupings of the same plugin. Just remember, plugin order matters.

require('./lib/collections');
require('./lib/markdown');
require('./lib/permalinks');
require('./lib/setTemplates');
require('./lib/compileTemplates');
//require('./lib/drafts');
require('./lib/css');
require('./lib/scripts');
require('./lib/rss');

console.log('Executing build ...');
metalsmith.build(function buildCB(err) {
  if (err) {
    console.log(err);
    console.log('Failed!');
    process.exit(1);
  }
  console.log('Done!');
});