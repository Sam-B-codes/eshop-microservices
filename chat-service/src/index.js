"use strict";

const path = require("node:path");

const mainPath = path.join(
  __dirname,
  "..",
  "dist",
  "main.js"
);

const mainModule = require(mainPath);

module.exports =
  mainModule.default ||
  mainModule;