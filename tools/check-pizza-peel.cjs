"use strict";
require("./qa-config.cjs");
require("./check-product-identity.cjs")(["pizza-peel"],"pizza-peel").catch(e=>{console.error(e);process.exitCode=1;});
