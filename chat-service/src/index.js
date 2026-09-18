"use strict";

const express = require("express");

const mainModule = require("../dist/main.js");

const app =
  mainModule.default ||
  mainModule;

// Keep Express directly referenced so Vercel identifies
// this file as the Express serverless entrypoint.
void express;

module.exports = app;