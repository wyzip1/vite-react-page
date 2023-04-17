"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _constants = _interopRequireDefault(require("../constants"));

var _userhome = _interopRequireDefault(require("../utils/userhome"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  VERSION_API,
  TOKEN_API,
  LOGIN_API,
  YOUZANYUN_HOST,
  YOUZANYUN_BASEURL
} = _constants.default;
let config = {
  baseURL: YOUZANYUN_BASEURL,
  headers: {
    host: YOUZANYUN_HOST
  }
};

if (_fsExtra.default.pathExistsSync((0, _userhome.default)('.youzanyun/config.json'))) {
  const custom_config = _fsExtra.default.readJsonSync((0, _userhome.default)('.youzanyun/config.json'));

  if (custom_config) {
    if (custom_config.YOUZANYUN_HOST) {
      config.headers.host = custom_config.YOUZANYUN_HOST;
    }

    if (custom_config.sc) {
      config.headers['X-Service-Chain'] = `{"name": "${custom_config.sc}"}`;
    }

    if (custom_config.YOUZANYUN_BASEURL) {
      config.baseURL = custom_config.YOUZANYUN_BASEURL;
    }
  }
}

var _default = {
  getLoginCheck: data => _axios.default.get(LOGIN_API, {
    params: data,
    ...config
  }),
  getToken: params => _axios.default.get(TOKEN_API, {
    params,
    ...config
  }),
  saveInfo: data => _axios.default.post(VERSION_API, data, config)
};
exports.default = _default;