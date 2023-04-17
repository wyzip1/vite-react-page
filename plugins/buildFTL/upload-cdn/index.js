"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _upload = _interopRequireDefault(require("./upload"));

var _logger = require("../utils/logger");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function _default(data, config) {
  let [cdnPath, ...filePaths] = data;

  if (_fsExtra.default.existsSync(cdnPath)) {
    filePaths.unshift(cdnPath);
    cdnPath = undefined;
  }

  const defaultConfig = {
    showInfo: true,
    hasHash: false
  };
  const curConfig = { ...defaultConfig,
    ...config
  };

  try {
    const result = await (0, _upload.default)(cdnPath, filePaths, curConfig);

    if (curConfig && curConfig.showInfo) {
      result.map(item => {
        if (item.message && item.message === "file exists") {
          _logger.logger.warn(`${item.file} 上传文件已存在`);
        } else {
          _logger.logger.success(`${item.file}  ->  ${item.url}`);
        }
      });
    }

    return result.map(item => item.url);
  } catch (err) {
    let {
      data,
      file
    } = err;

    if (file) {
      _logger.logger.error(`${file}上传失败：${data}`);
    } else {
      _logger.logger.error(`上传失败：${err}`);
    }

    process.exit(-1);
  }
}