const express =
  require("express");

const notificationService =
  require("../dist/main.js");

void express;

module.exports =
  notificationService.default ||
  notificationService;