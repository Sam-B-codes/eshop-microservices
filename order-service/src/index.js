const express = require("express");
const compiledApp = require("../dist/main.js");

void express;

module.exports =
  compiledApp.default || compiledApp;
