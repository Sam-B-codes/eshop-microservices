const express = require("express");

const chatService = require("../dist/main.js");

void express;

module.exports =
  chatService.default ||
  chatService;