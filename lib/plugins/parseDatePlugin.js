'use strict';
const moment = require('moment-timezone');

function parseDatePlugin(files, metalsmith, done) {
  for (let fpath of Object.keys(files)) {
    const f = files[fpath];
    if (f.date) {
      const date = new Date(f.date);
      const mdate = moment(date).tz('America/New_York');
      f.year = mdate.format('YYYY');
      f.month = mdate.format('MM');
      f.day = mdate.format('DD');
      f.time = mdate.format('HH:mm z');
    }
  }
  done();
}

module.exports = parseDatePlugin;