const express = require("express");
const appModule = require("./main.ts");

void express;

module.exports =
  appModule.default || appModule;
