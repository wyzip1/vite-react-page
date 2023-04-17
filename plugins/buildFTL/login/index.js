"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.logout = exports.login = exports.getUserInfo = void 0;

var _path = _interopRequireDefault(require("path"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _inquirer = _interopRequireDefault(import("inquirer"));

var _lodash = _interopRequireDefault(require("lodash.trim"));

var _userhome = _interopRequireDefault(require("../utils/userhome"));

var _git = require("../utils/git");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * 在用户根目录下缓存用户信息
 */
let yzyunCacheDir = (0, _userhome.default)(".youzanyun");

_fsExtra.default.ensureDirSync(yzyunCacheDir);

let authResultPath = _path.default.resolve(yzyunCacheDir, "authResult");

_fsExtra.default.ensureFileSync(authResultPath);
/**
 * 获取用户校验结果，如果没有则登录
 */

const getUserInfo = async function (
  { once } = {
    once: false,
  }
) {
  let userInfo = {};

  if (once) {
    try {
      userInfo = await _fsExtra.default.readJSON(authResultPath, "utf8");
    } catch (err) {
      userInfo = {};
    }
  }

  if (
    !userInfo ||
    !userInfo.mobile ||
    !userInfo.token ||
    !userInfo.appName ||
    !userInfo.authType
  ) {
    userInfo = await exports.login();
  }

  return userInfo;
}; // 登录

exports.getUserInfo = getUserInfo;

const login = async function () {
  const gitInfo = await (0, _git.getGitInfo)();
  let answers = await _inquirer.default.prompt([
    {
      type: "input",
      name: "username",
      message: "请输入username(手机号)：",
    },
    {
      type: "password",
      name: "password",
      message: "请输入password(GitToken)：",
    },
  ]);
  let username = (0, _lodash.default)(answers.username);
  let password = (0, _lodash.default)(answers.password);
  const userInfo = {
    mobile: username,
    token: password,
    appName: gitInfo.appName,
    authType: "CDN",
  };
  await _fsExtra.default.writeFile(authResultPath, JSON.stringify(userInfo), "utf8");
  return userInfo;
}; // 登出

exports.login = login;

const logout = async function () {
  const userInfo = {};
  await _fsExtra.default.writeFile(authResultPath, JSON.stringify(userInfo), "utf8");
};

exports.logout = logout;
