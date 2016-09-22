/**
 * Created by alexey2baranov on 9/21/16.
 */
// This will search for files ending in .test.js and require them
// so that they are added to the webpack bundle
"use strict";

var context = require.context('.', true, /.+\.test\.browser\.js?$/);
context.keys().forEach(context);
module.exports = context;