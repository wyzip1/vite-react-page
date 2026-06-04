# 接口与构建

## API 模块当前状态

接口入口位于 `src/api`：

| 文件 | 职责 | 当前状态 |
| --- | --- | --- |
| `src/api/config.ts` | 创建 axios 实例、设置 baseURL、请求/响应拦截、OpenAPI runtime config。 | 已接入，手写接口和未来生成接口都应复用。 |
| `src/api/index.ts` | 导出业务接口类型和接口函数。 | 当前只有 `fetchMockList`。 |
| `src/api/generated` | OpenAPI 生成目录。 | 当前目录不存在；`openapi-ts.config.ts` 预期输出到这里。 |

页面中通过接口函数配合 hooks 使用：

```ts
import { fetchMockList } from "@/api";
import useFetchList from "@/hooks/useFetchList";

const [setPageInfo, state, api] = useFetchList(fetchMockList, searchParams);
```

## axios 配置

`src/api/config.ts` 导出：

| 导出 | 类型 | 说明 |
| --- | --- | --- |
| `RequestResponse<T>` | `{ code: number; message: string; data: T }` | 普通业务响应结构。 |
| `RequestArraybufferResponse` | `{ type: string; filename: string; value: ArrayBuffer }` | 文件/二进制响应结构。 |
| `baseURL` | `string` | 开发环境为 `/developmentApi`，非开发环境为 `window.location.origin`。 |
| `axiosInstance` | `AxiosInstance` | 统一请求实例。 |
| `createClientConfig` | `CreateClientConfig` | 给 `@hey-api/client-axios` 生成客户端使用的 runtime config。 |

请求拦截器行为：

- 如果 `config.data` 是普通对象，会通过 `filterObjEmpty` 过滤空值。
- `FormData`、`URLSearchParams`、数组、字符串、`null` 不会被当作普通对象处理。
- `config.params` 也会通过 `filterObjEmpty` 过滤空值。

响应拦截器行为：

- 如果 `res.data` 是 `ArrayBuffer`，进入 `handleArraybufferRequest`。
- 业务响应 `code` 不在 `[0, 200]` 内时，调用 `message.error(res.data.message)` 并 reject。
- 网络或 axios 错误如果不是 `ERR_CANCELED`，会展示 `err.response.data.message` 或 `err.message`。
- 成功时返回 `res.data`，因此接口函数类型通常写成 `Promise<RequestResponse<T>>`。

`handleArraybufferRequest` 规则：

- `content-type` 包含 `application/json` 时，用 `TextDecoder("utf-8")` 解码并 `JSON.parse`。
- 其他类型从 `content-disposition` 解析 filename，返回 `{ code: 200, message: "ok", data: { type, filename, value } }`。

## mock 列表接口

当前 mock 文件是 `mock/index.ts`，通过 `vite-plugin-mock` 加载。

接口定义：

| 项 | 值 |
| --- | --- |
| URL | `/developmentApi/api/list` |
| method | `post` |
| 延迟 | `sleep(1000)` |
| 入参来源 | JSON body 优先，同时兼容 URL query |
| 分页字段 | `pageNum`、`pageSize` |
| 筛选字段 | `name`，按 `item.name.includes(name)` 过滤 |
| 响应结构 | `{ code: 200, message: "ok", data: { list, total } }` |

与 `fetchMockList` 的关系：

```ts
export const fetchMockList = ({ cancelToken, body }) => {
  return axiosInstance({
    url: "/api/list",
    method: "POST",
    cancelToken,
    data: body,
  }) as Promise<RequestResponse<List<MockListItem>>>;
};
```

开发环境 `baseURL` 是 `/developmentApi`，所以实际请求路径为 `/developmentApi/api/list`，与 mock URL 对齐。

## MockList 类型

`src/api/index.ts` 定义：

| 类型 | 字段 | 字段类型 | 说明 |
| --- | --- | --- | --- |
| `MockListItem` | `id` | `number` | 行唯一标识，表格 `rowKey` 使用。 |
| `MockListItem` | `name` | `string` | 姓名，搜索和表格展示使用。 |
| `MockListItem` | `sex` | `number` | 性别编码，list 页展示为 `0 -> 女`、`1 -> 男`、其他 -> 未知。 |
| `MockListItem` | `desc` | `string` | 描述。 |
| `MockListItem` | `data` | `{ money: number }` | 嵌套数据，表格列使用 `data.money`。 |
| `MockListItem` | `test` | `any` | 可选测试字段，表格 select 列使用。 |
| `MockListItem` | `date` | `string` | 可选日期字符串。 |
| `MockListItem` | `dateRange` | `[string, string]` | 可选日期范围。 |
| `MockListParams` | `pageNum` | `number` | 来自 `Pagination`。 |
| `MockListParams` | `pageSize` | `number` | 来自 `Pagination`。 |
| `MockListParams` | `name` | `string` | 可选姓名筛选。 |

## OpenAPI

项目保留了 `openapi-ts.config.ts` 和主工程脚本：

```bash
npm run openapi
```

当前配置：

| 配置 | 当前值 | 说明 |
| --- | --- | --- |
| `input` | `""` | 还没有配置 OpenAPI schema，因此当前不能直接生成有效客户端。 |
| `output.path` | `./src/api/generated` | 生成代码目标目录。 |
| `output.format` | `prettier` | 生成后格式化。 |
| `output.lint` | `eslint` | 生成后执行 lint。 |
| `@hey-api/client-axios` | `runtimeConfigPath: "../config"` | 生成客户端会引用 `src/api/config.ts` 的 `createClientConfig`。 |
| `@hey-api/typescript` | `enums: "javascript"` | 枚举以 JavaScript 形式输出。 |
| `@hey-api/schemas` | 启用 | 生成 schema。 |
| `@hey-api/sdk` | 启用 | 生成 SDK 方法。 |

使用约定：

- 接入前先把 `input` 配置成有效 OpenAPI 地址或本地文件。
- 保持 `runtimeConfigPath: "../config"`，让生成接口复用统一 axios 实例和拦截器。
- 生成产物应放在 `src/api/generated`，手写 API 可继续从 `src/api/index.ts` 统一出口转发。
- 不要手改生成目录；需要调整请求行为时改 `src/api/config.ts`。

## 主应用构建

主应用脚本位于根目录 `package.json`：

| 脚本 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务，默认 `0.0.0.0:3000`。 |
| `npm run dev:scan` | 使用 `scan` mode 启动，`src/main.tsx` 会启用 `react-scan`。 |
| `npm run build` | 构建主应用，生成 Vite 产物和 FTL 产物。 |
| `npm run openapi` | 执行 OpenAPI 客户端生成，当前需先补齐 `input`。 |

构建产物：

| 产物 | 来源 | 说明 |
| --- | --- | --- |
| `dist` | Vite 默认构建输出 | 静态资源、HTML、manifest 和拆分后的 chunk。 |
| `dist/.vite/manifest.json` | `build.manifest: true` | 资源 manifest。实际路径按 Vite 版本输出规则生成。 |
| `dist2` | `buildFTL({ ftlDir: "./dist2" })` | FTL 相关产物目录。 |

Rollup 手动拆包：

| chunk | 依赖 |
| --- | --- |
| `react` | `react` |
| `react-router-dom` | `react-router-dom` |
| `react-dom` | `react-dom` |
| `antd` | `antd` |
| `styled-components` | `styled-components` |

## 文档工程构建

文档工程脚本位于 `docs/package.json`，需要进入 `docs` 后执行：

```bash
cd docs
npm install
npm run dev
npm run build
npm run preview
```

| 脚本 | 说明 |
| --- | --- |
| `npm run dev` | 启动 VitePress 开发服务。 |
| `npm run build` | 构建静态文档站点，输出到 `docs/.vitepress/dist`。 |
| `npm run preview` | 预览已构建的文档站点。 |

文档依赖与主应用隔离，不写入根目录 `package.json`。
