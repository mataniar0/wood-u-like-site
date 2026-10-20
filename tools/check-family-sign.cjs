"use strict";
require("./qa-config.cjs");
require("./check-product-identity.cjs")(["family-sign"],"family-sign").catch(e=>{console.error(e);process.exitCode=1;});
