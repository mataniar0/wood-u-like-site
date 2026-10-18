"use strict";
require('./check-product-identity.cjs')(['family-sign','hanging-home-sign','pizza-peel'],'pizza-peel').catch(e=>{console.error(e);process.exitCode=1;});
