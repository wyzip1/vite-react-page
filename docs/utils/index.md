# Utils 总览

工具函数位于 `src/utils`，入口文件是 `src/utils/index.ts`。页面和组件优先从 `@/utils` 导入入口导出的能力；未在入口导出的模块能力需要从对应 `@/utils/module/*` 文件导入。

## 入口导出

| 分类 | 导出 | 源文件 | 职责 |
| --- | --- | --- | --- |
| copy | `copyInfo`、`createImg` | `src/utils/module/copy.ts` | 复制文本/图片，创建并加载图片元素。 |
| date | `formatDate` | `src/utils/module/date.ts` | 将 `number`、`string`、`Date` 格式化为字符串。 |
| tree | `assembleTree`、`eachTree`、`formatTree`、`findTreePath` | `src/utils/module/tree.ts` | 列表转树、树遍历、树转换、查找节点路径。 |
| query | `getCookie`、`transferDataToQuery`、`transferQueryToData`、`parseJSON` | `src/utils/module/parseQuery.ts` | 查询字符串、cookie 和 JSON 字符串转换。 |
| number | `formatNum`、`formatMutipleNum`、`formatMoneyPreSubFix`、`rangeNum` | `src/utils/module/number.ts` | 数字补零、倍率换算、金额拆分、范围数组生成。 |
| object | `setValue`、`getValue`、`filterObjEmpty` | `src/utils/module/object.ts` | 对象点路径读写和空值字段过滤。 |
| subscribe | `events` | `src/utils/module/subscribe.ts` | 全局事件总线实例。 |
| common | `guid`、`debounce`、`throttle`、`toggleList`、`selectFile`、`downloadArraybufferFile`、`sleep` | `src/utils/index.ts` | 随机 ID、函数频控、数组切换、文件选择、文件下载、延迟。 |

## 模块额外导出

这些能力没有通过 `src/utils/index.ts` 统一导出，但模块自身有导出，使用时从具体文件导入。

| 模块 | 额外导出 | 导入路径 | 职责 |
| --- | --- | --- | --- |
| date | `parseDateFormatSetting` | `@/utils/module/date` | 将格式字符串拆成带重复序号的 token 列表，供 `formatDate` 使用。 |
| query | `transferStringListToData` | `@/utils/module/parseQuery` | 将 `["a=1", "b={...}"]` 转为对象，值会尝试 JSON 解析。 |
| storage | `default storage` | `@/utils/module/storage` | 命名空间为 `client`、默认加密的 `localStorage` 包装实例。 |
| jsencrypt | `encrypt`、`decrypt`、`encryptLong`、`decryptLong` | `@/utils/module/jsencrypt` | 基于 `jsencrypt` 和源码内置密钥做 RSA 加解密。 |
| copy | `copyToEl`、`copyText`、`copyImg` | `@/utils/module/copy` | 复制 DOM 节点、文本、图片的底层方法。 |
| path | `default Path` | `@/utils/module/path` | 生成对象点路径联合类型。 |

## 环境与副作用速查

| 能力 | 修改入参 | 浏览器 API 依赖 | 主要副作用 |
| --- | --- | --- | --- |
| `assembleTree` | 是，给列表节点写入 `children` 字段 | 否 | 改写传入列表中的对象节点。 |
| `formatTree` | 否，先浅拷贝当前节点 | 否 | 无外部副作用；callback 可自行产生副作用。 |
| `setValue` | 是，按路径写入原对象 | 否 | 中间路径不存在时创建对象。 |
| `toggleList` | 是，`push` 或 `splice` 原数组 | 否 | 原数组内容变化。 |
| `selectFile` | 否 | `document`、`FileList` | 创建 input 并触发文件选择弹窗。 |
| `downloadArraybufferFile` | 否 | `Blob`、`URL`、`document` | 触发浏览器下载。 |
| copy 模块 | `copyToEl` 会临时挂载传入元素 | `window`、`document`、`navigator.clipboard`、`fetch` | 写剪贴板、显示 antd message、失败时打印日志。 |
| query cookie | 否 | `location`、`document.cookie` | 读取 URL 或 cookie。 |
| storage | 否 | `localStorage` | 读写、删除或清空浏览器本地存储。 |
| jsencrypt | 否 | 否，依赖 `jsencrypt` 库 | 使用源码内置公私钥加解密。 |
| subscribe | 否 | 否 | 保存/移除事件处理器；触发处理器。 |

## 文档分布

按 module 独立文档：

| 模块 | 覆盖源码 |
| --- | --- |
| [common/index](/utils/common) | `src/utils/index.ts` |
| [copy](/utils/module-copy) | `src/utils/module/copy.ts` |
| [date](/utils/module-date) | `src/utils/module/date.ts` |
| [number](/utils/module-number) | `src/utils/module/number.ts` |
| [parseQuery](/utils/module-parse-query) | `src/utils/module/parseQuery.ts` |
| [object](/utils/module-object) | `src/utils/module/object.ts` |
| [path](/utils/module-path) | `src/utils/module/path.ts` |
| [tree](/utils/module-tree) | `src/utils/module/tree.ts` |
| [storage](/utils/module-storage) | `src/utils/module/storage.ts` |
| [jsencrypt](/utils/module-jsencrypt) | `src/utils/module/jsencrypt.ts` |
| [subscribe](/utils/module-subscribe) | `src/utils/module/subscribe.ts` |

组合页保留为主题汇总：

- `docs/utils/browser-common.md`：copy、subscribe、guid、debounce、throttle、toggleList、selectFile、downloadArraybufferFile、sleep。
- `docs/utils/object-tree.md`：`Path<T>`、对象点路径读写、树工具。
- `docs/utils/format-query-storage.md`：date、number、query、storage、jsencrypt。

## 使用建议

- SSR、Node 脚本、单元测试环境中避免直接调用依赖 DOM、Clipboard、`location`、`document.cookie`、`localStorage` 的工具，必要时注入 mock。
- `transferDataToQuery` 和 `transferQueryToData` 不做 URL 编码/解码，值中包含 `&`、`=`、空格或中文时应先自行处理。
- `storage` 的密钥写在源码中，加密只适合弱保护本地缓存，不应作为安全边界。
- `Path<T>` 是类型工具，运行时不会校验路径是否真实存在；`getValue` 找不到路径返回 `undefined`，`setValue` 会创建缺失中间对象。
