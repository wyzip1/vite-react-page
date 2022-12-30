"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.promiseSpawm = exports.promiseExec = void 0;

var _child_process = require("child_process");

const promiseSpawm = function promiseSpawm(cmd, param, options, log) {
  return new Promise((resolve, reject) => {
    options.stdio = "pipe"; //options.encoding = 'utf8';

    options.shell = true;
    options.env = process.env;
    options.env.LC_CTYPE = "UTF-8";
    let error_cache = "";
    const ls = (0, _child_process.spawn)(cmd, param, options);
    ls.on("error", err => {
      if (log) {
        log.report(`err ${err}`);
      } else {
        console.error(err);
      }

      reject(err);
    });

    if (ls.stdout) {
      ls.stdout.on("data", data => {
        if (log) {
          log.report(`${data}`);
        } else {
          console.log(data.toString("utf-8"));
        }
      });
    }

    if (ls.stderr) {
      ls.stderr.on("data", data => {
        if (log) {
          log.report(`${data}`);
        } else {
          error_cache += data.toString("utf-8");
        }
      });
    }

    ls.on("close", code => {
      if (log) {
        log.report(`return code ${code} `);
      }

      if (+code === 0) {
        resolve(code);
      } else {
        reject(error_cache);
      }
    });
  });
};

exports.promiseSpawm = promiseSpawm;

const promiseExec = function (cmd, options) {
  return new Promise((resolve, reject) => {
    options.shell = true;
    options.env = process.env;
    options.env.LC_CTYPE = "UTF-8";
    (0, _child_process.exec)(cmd, options, (error, stdout, stderr) => {
      if (error) {
        console.log("error", error);
        reject(error);
        return;
      }

      if (stderr) {
        console.log("stderr", stderr);
        reject(stderr);
        return;
      }

      resolve(stdout);
    });
  });
};

exports.promiseExec = promiseExec;