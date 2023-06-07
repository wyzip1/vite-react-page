"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var generator_1 = __importDefault(require("@babel/generator"));
var types_1 = require("@babel/types");
var helper_plugin_utils_1 = require("@babel/helper-plugin-utils");
var DEFAULT_PRE_TIP = "--------------------";
function generateStrNode(str) {
    var node = (0, types_1.stringLiteral)(str);
    // @ts-ignore
    node.skip = true;
    // @ts-ignore
    return node;
}
exports.default = (0, helper_plugin_utils_1.declare)(function (babel, _a) {
    var _b = _a.preTip, preTip = _b === void 0 ? DEFAULT_PRE_TIP : _b, _c = _a.splitBy, splitBy = _c === void 0 ? "" : _c, _d = _a.endLine, endLine = _d === void 0 ? false : _d;
    var t = babel.types;
    var splitNode = splitBy ? generateStrNode(splitBy === true ? "" : splitBy) : undefined;
    return {
        name: "enhance-log",
        visitor: {
            CallExpression: function (path) {
                var calleeCode = (0, generator_1.default)(path.node.callee).code;
                if (calleeCode !== "console.log")
                    return;
                var nodeArguments = path.node.arguments;
                // 遍历 console.log 的所有参数
                for (var i = 0; i < nodeArguments.length; i++) {
                    var argument = nodeArguments[i];
                    // 跳过分隔符
                    // @ts-ignore
                    if (argument.skip)
                        continue;
                    // 如果是字面量值，或者是变量但没有变量名称就当前参数后面插入一个分隔符
                    if (t.isLiteral(argument) ||
                        (t.isIdentifier(argument) && argument.name === "undefined")) {
                        splitNode && nodeArguments.splice(i + 1, 0, splitNode);
                        continue;
                    }
                    // @ts-ignore
                    argument.skip = true;
                    // 在当前参数的前面添加变量名称的打印参数，并且往后添加一个分隔符
                    var node = generateStrNode("".concat((0, generator_1.default)(argument).code, " ="));
                    nodeArguments.splice(i, 0, node);
                    splitNode && nodeArguments.splice(i + 2, 0, splitNode);
                }
                // 如果console.log最后一个参数是分隔符就移除掉
                if (splitNode && nodeArguments[nodeArguments.length - 1] === splitNode)
                    nodeArguments.pop();
                // loc 代码行数信息对象
                var loc = path.node.loc;
                if (!loc)
                    return;
                // 添加console.log所在开始行信息
                var startLine = loc.start.line;
                var startLineTipNode = t.stringLiteral("START LINE OF ".concat(startLine, " ").concat(preTip, "\n"));
                nodeArguments.unshift(startLineTipNode);
                // 添加console.log所在结束行信息
                if (endLine) {
                    var endLine_1 = loc.end.line;
                    var endLineTipNode = t.stringLiteral("\nEDN LINE OF ".concat(endLine_1, " ").concat(preTip, "\n"));
                    nodeArguments.push(endLineTipNode);
                }
            },
        },
    };
});
