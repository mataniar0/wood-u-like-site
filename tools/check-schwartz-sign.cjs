"use strict";
require('./check-product-identity.cjs')(['family-sign','hanging-home-sign'],'schwartz-sign').catch(e=>{console.error(e);process.exitCode=1;});
