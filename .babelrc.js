const nLog = require("./plugins/n-log/index").default;

/**@type {import('./plugins/n-log/index.d.ts').nLogOptions} */
const nLogOptions = {
  endLine: true,
  splitBy: "\n",
};

/**
 * @param {import('@babel/core').ConfigAPI} api
 * @returns {import('@babel/core').TransformOptions}
 * */
function initOptions(api) {
  api.cache(true);
  return {
    plugins: [[nLog, nLogOptions]],
  };
}

module.exports = initOptions;
