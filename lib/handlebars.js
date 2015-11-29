'use strict';
const fs = require('fs');
const jrfom = require('laic').laic.jrfom;
const rootPath = jrfom.get('rootPath');
const Handlebars = require('handlebars');
jrfom.register('Handlebars', Handlebars);

Handlebars.registerHelper('slugify', function slugify(str) {
  return encodeURI(str.toLocaleLowerCase().replace(' ', '-'));
});

Handlebars.registerHelper('sanitizePath', function sanitizePath(str) {
  // sanitize file path for use in a URL
  return str.replace(/^\.\//, '');
});

Handlebars.registerPartial(
  'header',
  fs.readFileSync(rootPath + '/templates/partials/header.hbt').toString()
);

Handlebars.registerPartial(
  'content-header',
  fs.readFileSync(rootPath + '/templates/partials/content-header.hbt').toString()
);


Handlebars.registerPartial(
  'footer',
  fs.readFileSync(rootPath + '/templates/partials/footer.hbt').toString()
);

Handlebars.registerPartial(
  'post',
  fs.readFileSync(rootPath + '/templates/partials/post.hbt').toString()
);