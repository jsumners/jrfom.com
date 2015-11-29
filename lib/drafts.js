'use strict';
const jrfom = require('laic').jrfom;
const metalsmith = jrfom.get('metalsmith');

console.log('Removing drafts ...');
const drafts = require('metalsmith-drafts');
metalsmith.use(drafts());