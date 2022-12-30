"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  var home = process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"];

  if (!home) {
    throw new Error("Could not find a valid user home path.");
  }

  return _path.default.resolve.apply(_path.default.resolve, [home].concat(Array.prototype.slice.call(arguments, 0)));
}