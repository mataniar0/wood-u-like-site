"use strict";
require("./qa-config.cjs");
require("./check-product-identity.cjs")(["hanging-home-sign"],"schwartz-sign").catch(e=>{console.error(e);process.exitCode=1;});
