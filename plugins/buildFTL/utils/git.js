"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getGitInfo = exports.checkGitStatus = void 0;

var _logger = require("./logger");

var _run = require("./run");

const getGitInfo = async function (gitRepoDir) {
  const gitInfo = {};

  try {
    /* 获取remote信息 */
    const remoteInfo = await (0, _run.promiseExec)("git remote -v", {
      cwd: gitRepoDir
    });
    const appNameArr = remoteInfo.split("/").pop().split(".");
    gitInfo.appName = appNameArr.slice(0, appNameArr.length - 1).join("/");
    /* 用户名 */

    const username = await (0, _run.promiseExec)("git config user.name", {
      cwd: gitRepoDir
    });
    gitInfo.username = username || "unknown";
    /* commitId */

    const commitId = await (0, _run.promiseExec)("git rev-parse HEAD", {
      cwd: gitRepoDir
    });
    gitInfo.commitId = commitId;
    return gitInfo;
  } catch (error) {
    _logger.logger.error("请在项目目录下操作");

    process.exit(0);
  }
};

exports.getGitInfo = getGitInfo;

const checkGitStatus = async function (gitRepoDir) {
  try {
    const statusInfo = await (0, _run.promiseExec)("git status -s", {
      cwd: gitRepoDir
    });
    return !statusInfo;
  } catch (error) {
    _logger.logger.error("请在项目目录下操作");

    process.exit(0);
  }
};

exports.checkGitStatus = checkGitStatus;