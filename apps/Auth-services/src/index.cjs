const express = require("express");
const appModule = require("../dist/main.js");

void express;

module.exports =
  appModule.default || appModule;
