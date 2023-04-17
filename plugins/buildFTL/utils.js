"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addJsImportFile = addJsImportFile;
exports.getAppName = getAppName;
exports.injectToHead = injectToHead;
exports.uploadCdn = uploadCdn;

var _child_process = require("child_process");

var _path = _interopRequireDefault(require("path"));

var _index = _interopRequireDefault(require("./upload-cdn/index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const headInjectRE = /([ \t]*)<\/head>/i;
const headPrependInjectRE = /([ \t]*)<head[^>]*>/i;
const htmlPrependInjectRE = /([ \t]*)<html[^>]*>/i;
const bodyPrependInjectRE = /([ \t]*)<body[^>]*>/i;
const doctypePrependInjectRE = /<!doctype html>/i;

function prependInjectFallback(html, tags) {
  if (htmlPrependInjectRE.test(html)) {
    return html.replace(htmlPrependInjectRE, `$&\n${serializeTags(tags)}`);
  }

  if (doctypePrependInjectRE.test(html)) {
    return html.replace(doctypePrependInjectRE, `$&\n${serializeTags(tags)}`);
  }

  return serializeTags(tags) + html;
}

function injectToHead(html, tags, prepend = false) {
  if (prepend) {
    if (headPrependInjectRE.test(html)) {
      return html.replace(headPrependInjectRE, (match, p1) => `${match}\n${serializeTags(tags, incrementIndent(p1))}`);
    }
  } else {
    if (headInjectRE.test(html)) {
      return html.replace(headInjectRE, (match, p1) => `${serializeTags(tags, incrementIndent(p1))}${match}`);
    }

    if (bodyPrependInjectRE.test(html)) {
      return html.replace(bodyPrependInjectRE, (match, p1) => `${serializeTags(tags, p1)}\n${match}`);
    }
  }

  return prependInjectFallback(html, tags);
}

const unaryTags = new Set(["link", "meta", "base"]);

function serializeTag({
  tag,
  attrs,
  children
}, indent) {
  if (unaryTags.has(tag)) {
    return `<${tag}${serializeAttrs(attrs)}>`;
  } else {
    return `<${tag}${serializeAttrs(attrs)}>${serializeTags(children, incrementIndent(indent))}</${tag}>`;
  }
}

function incrementIndent(indent) {
  return `${indent}${indent[0] === "\t" ? "\t" : "  "}`;
}

function serializeAttrs(attrs) {
  let res = "";

  for (const key in attrs) {
    if (typeof attrs[key] === "boolean") {
      res += attrs[key] ? ` ${key}` : "";
    } else {
      res += ` ${key}=${JSON.stringify(attrs[key])}`;
    }
  }

  return res;
}

function serializeTags(tags, indent = "") {
  if (typeof tags === "string") {
    return tags;
  } else if (tags && tags.length) {
    return tags.map(tag => `${indent}${serializeTag(tag, indent)}\n`).join("");
  }

  return "";
}

function addJsImportFile(obj, file) {
  return obj[file].imports ?? [];
}

function getAppName() {
  const options = {};
  options.shell = true;
  options.env = process.env;
  options.env.LC_CTYPE = "UTF-8";
  options.cwd = process.cwd();
  const remote = (0, _child_process.execSync)("git remote -v", options).toString("utf8");
  const appNameArr = remote.split("/").pop().split(".");
  return appNameArr.slice(0, appNameArr.length - 1).join("/");
}

function uploadCdn(filelist, distDir) {
  const appName = getAppName();
  const filenames = {};

  async function uploadFile(filenames) {
    const arr = Object.keys(filenames);

    for (let i = 0, len = arr.length; i < len; i++) {
      await (0, _index.default)([`${appName}/assets`, ...filenames[arr[i]]], {
        hasHash: false
      });
    }
  }

  function execFile(file) {
    const ext = _path.default.extname(file).slice(1);

    if (ext !== "css" && ext !== "js") {
      return;
    }

    if (!filenames[ext]) {
      filenames[ext] = [];
    }

    filenames[ext].push(_path.default.join(`${distDir}`, file));
  }

  const outputs = filelist;
  outputs.map(v => {
    execFile(v);
  });
  uploadFile(filenames);
}