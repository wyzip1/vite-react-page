"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = upload;

var _path = _interopRequireDefault(require("path"));

var _qiniu = _interopRequireDefault(require("qiniu"));

var _logger = require("../utils/logger");

var _api = _interopRequireDefault(require("../api"));

var _login = require("../login");

var _constants = _interopRequireDefault(require("../constants"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  CDN_DOMAIN
} = _constants.default;
const formUploader = new _qiniu.default.form_up.FormUploader(getQiniuConfig());
/**
 * 文件上传
 * file: 本地文件路径
 */

async function upload(cdnPath, files) {
  if (!files || files.length === 0) {
    _logger.logger.error("无可上传文件");

    process.exit(0);
  }

  let token;

  try {
    const userInfo = await (0, _login.getUserInfo)({
      once: true
    });
    token = await getToken(userInfo);
  } catch (err) {
    // 获取上传token失败
    await (0, _login.logout)();
    return Promise.reject(err);
  }

  let currentFiles = [];

  if (typeof files !== "string" && !(files instanceof Array)) {
    return Promise.reject('上传文件参数类型错误: expect "string" or "Array"');
  } else if (typeof files === "string") {
    currentFiles.push(files);
  } else {
    currentFiles = files;
  }

  return Promise.all(currentFiles.map(file => {
    return new Promise((resolve, reject) => {
      const fileName = file.split(_path.default.sep).pop();
      const fileFirstNameArr = fileName.split(".");
      const fileExt = fileFirstNameArr.pop();
      const fileFirstName = fileFirstNameArr.join(".");
      const uploadPath = cdnPath ? `${CDN_DOMAIN}/${cdnPath}` : `${CDN_DOMAIN}`;
      let newName = `${uploadPath}/${fileFirstName}.${fileExt}`;
      const putExtra = new _qiniu.default.form_up.PutExtra();
      formUploader.putFile(token, newName, file, putExtra, (respErr, respBody, respInfo) => {
        // 上传失败
        if (respErr) {
          reject(respErr);
        }

        if (+respInfo.statusCode === 200) {
          const url = respBody.data.attachment_full_url;
          resolve({
            file,
            url: url.replace("http:", "https:")
          });
        } else {
          if (respInfo.data && respInfo.data.error === "file exists") {
            resolve({
              message: "file exists",
              file,
              url: uploadPath
            });
          } // 上传返回信息不正确


          reject({
            data: respInfo.data,
            file
          });
        }
      });
    });
  }));
}
/**
 * 获取文件上传 Token
 */


async function getToken(userInfo) {
  const res = await _api.default.getToken(userInfo);

  if ((+res.status === 0 || +res.status === 200) && res.data && res.data.uploadToken) {
    return res.data.uploadToken;
  } else {
    throw new Error(res.data.msg || res.msg || "获取token失败");
  }
}
/**
 * 获取 七牛 CDN 配置
 */


function getQiniuConfig() {
  return new _qiniu.default.conf.Config({
    // 空间对应的机房
    zone: _qiniu.default.zone.Zone_z0,
    // 是否使用 https 域名
    useHttpsDomain: true,
    // 上传是否使用 cdn 加速
    useCdnDomain: true
  });
}