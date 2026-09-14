const notificationService =
  require("../dist/main.js");

module.exports =
  notificationService.default ||
  notificationService;