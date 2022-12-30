"use strict";

const signale = require("signale");

const {
  Signale
} = signale;
/**
 * 创建一个交互式 Looger
 * @returns
 */

const createInteractive = function (options) {
  const interactive = new Signale({ ...options,
    interactive: true
  });
  return interactive;
};

module.exports = {
  logger: signale,
  createInteractive
};