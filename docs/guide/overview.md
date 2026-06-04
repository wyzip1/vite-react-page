# 工程总览

`vite-react-page` 是一个基于 Vite 5 + React 18 的管理端工程。主应用负责业务页面、路由、布局、状态、接口和构建；`docs` 是独立 VitePress 文档工程，依赖、脚本和构建产物都与主应用隔离。

当前主应用的核心能力包括：

- React Router hash 路由，以及扩展路由字段驱动的菜单、面包屑、重定向、权限占位和 KeepAlive。
- Ant Design 5、Tailwind CSS 4、styled-components 组合的 UI 与样式方案。
- Redux Toolkit + React Redux 管理主题状态。
- Axios 请求实例、请求拦截、响应拦截、mock 列表接口和 OpenAPI 客户端生成入口。
- 多页构建插件、React Scan 模式、mock 服务、FTL 构建产物和 vendor chunk 拆分。

## 技术栈

| 能力 | 依赖 | 说明 |
| --- | --- | --- |
| 构建与开发 | `vite@^5.2.11`、`@vitejs/plugin-react@^4.2.1` | 提供 React 开发服务器、Fast Refresh 和生产构建。 |
| React | `react@^18.3.1`、`react-dom@^18.3.1` | 应用渲染、hooks、组件模型。 |
| 路由 | `react-router-dom@=6.24.1` | `createHashRouter`、`RouterProvider`、`matchRoutes`、`Outlet`、`Link`、`Navigate` 等路由能力。 |
| UI 组件 | `antd@^5.6.2`、`@ant-design/icons@^4.8.0` | 布局、菜单、面包屑、按钮、表格、表单、弹窗、消息提示。 |
| 状态管理 | `@reduxjs/toolkit@^1.9.1`、`react-redux@^8.0.5`、`redux@^4.2.0` | `configureStore`、slice、Provider、selector hooks。 |
| 样式 | `styled-components@^5.3.6`、`tailwindcss@^4.1.18`、`@tailwindcss/vite@^4.1.18`、`sass`、`autoprefixer` | styled-components 主题样式、Tailwind 工具类、CSS 预处理和前缀处理。 |
| 请求 | `axios@^1.2.1` | `axiosInstance`、拦截器、取消请求、数组缓冲响应处理。 |
| mock | `vite-plugin-mock@^3.0.2`、`mockjs@^1.1.0` | 开发服务加载 `mock` 目录，当前提供 `/developmentApi/api/list`。 |
| OpenAPI | `@hey-api/openapi-ts@^0.91.1` | 预留生成 `src/api/generated` 的配置和 `npm run openapi` 脚本。 |
| 多页与产物 | `vite-plugin-multipage-auto`、`build-ftl` | 自动多页入口和 FTL 产物输出到 `dist2`。 |
| 质量与调试 | `typescript@^5.7.2`、`eslint`、`prettier`、`react-scan` | TS 类型检查基础、代码规范、格式化和 scan 模式渲染观察。 |

## 主工程脚本

根目录 `package.json` 的脚本如下：

| 脚本 | 命令 | 说明 |
| --- | --- | --- |
| `dev` | `vite` | 启动主应用开发服务，默认端口由 `vite.config.ts` 配置为 `3000`，host 为 `0.0.0.0`。 |
| `dev:scan` | `vite --mode scan` | 以 `scan` 模式启动；`src/main.tsx` 在 `import.meta.env.MODE === "scan"` 时启用 `react-scan`。 |
| `build` | `vite build` | 构建主应用，输出 Vite 产物并生成 manifest；`build-ftl` 额外输出 FTL 产物到 `dist2`。 |
| `openapi` | `openapi-ts` | 根据 `openapi-ts.config.ts` 生成 API 客户端。当前 `input` 为空，执行前需要先配置 schema 地址或文件。 |

## Vite 配置

`vite.config.ts` 使用 `defineConfig(({ mode }) => ...)`，核心配置如下：

| 配置项 | 当前值/插件 | 影响 |
| --- | --- | --- |
| `plugins` | `react()` | 支持 React JSX、Fast Refresh。 |
| `plugins` | `AutoImport({ imports: ["react", "react-router-dom"], include: [/\.ts$/, /\.tsx$/, /\.md$/] })` | 自动导入 React 和 React Router 常用 API，源码中可直接使用 `useState`、`Outlet`、`Link` 等。 |
| `plugins` | `tailwindcss()` | 启用 Tailwind CSS Vite 插件。 |
| `plugins` | `MultiPageAutoPlugin()` | 自动处理多页入口，配合 `src/pages/<page>/main.tsx` 使用。 |
| `plugins` | `buildFTL({ ftlDir: "./dist2" })` | 构建 FTL 产物到根目录 `dist2`。 |
| `plugins` | `viteMockServe({ mockPath: "mock" })` | 开发服务加载根目录 `mock` 下的接口定义。 |
| `optimizeDeps.include` | 根 `package.json` 的所有 dependencies | 预构建运行时依赖，减少开发启动时的依赖解析成本。 |
| `resolve.alias` | `@ -> ./src` | 主应用源码使用 `@/xxx` 引用 `src` 下模块。 |
| `resolve.extensions` | `.js`、`.tsx`、`.vue`、`.jsx`、`.ts` | 允许省略这些扩展名导入。 |
| `server` | `host: "0.0.0.0"`、`port: 3000`、`open: true` | 开发服务监听所有网卡，默认 3000 端口，并自动打开浏览器。 |
| `server.proxy` | `/developmentApi` | 代理到 `target: ""`，并移除 `/developmentApi` 前缀；当前 mock 也使用此前缀。 |
| `build.manifest` | `true` | 构建时生成 manifest 文件。 |
| `build.rollupOptions.output.manualChunks` | `react`、`react-router-dom`、`react-dom`、`antd`、`styled-components` | 将主要运行时依赖拆成独立 chunk。 |
| `base` | `development`/`scan` 为 `/`，其他模式为 `build-ftl` 的 `publicPath` | 控制静态资源基础路径。 |
| `css.preprocessorOptions.less.javascriptEnabled` | `true` | 支持 Less JavaScript 表达式。 |
| `css.preprocessorOptions.scss.charset` | `false` | 阻止 SCSS 输出 `@charset`。 |
| `css.postcss.plugins` | `autoprefixer`、`internal:charset-removal` | 自动补前缀，并移除样式库中的 `@charset` at-rule。 |

## 应用入口

主应用入口由 `src/main.tsx` 挂载到 `#app`，Provider 层级为：

```text
Provider(store)
  AntConfigProvider
    KeepAliveProvider
      CRouterProvider(router)
```

`src/App.tsx` 导出两个对象：

| 导出 | 类型 | 职责 |
| --- | --- | --- |
| `AntConfigProvider` | `React.FC<{ children?: React.ReactNode }>` | 包装 Ant Design `ConfigProvider`，设置中文 locale、亮暗主题算法、主题色 `#155bd4` 和 `borderRadius: 0`。 |
| `App` | `function App()` | 顶层布局容器，监听系统暗色模式变化，渲染 `MainStyled` 和 `Outlet`。 |

当前业务页面是 `/list`，由 `src/pages/list/App.tsx` 实现。页面使用 `Search`、`EditTable`、`AsyncButton`、`CustomModal` 和 `useFetchList` 串起查询、分页、编辑、保存和弹窗流程。

## 核心设计

### 路由驱动菜单

路由配置不仅描述 URL 与组件关系，还包含菜单标题、隐藏状态、重定向、激活路径、权限和 keepAlive 等元信息。布局侧边栏、面包屑和内容缓存都依赖路由元信息。

### 组件抽象围绕业务表单和表格

`Search` 负责搜索表单配置化，`EditTable` 负责表格单元格编辑，`CustomModal` 与 `useModal` 负责命令式弹窗。这些组件面向管理端高频场景，减少页面层重复代码。

### Hooks 封装请求生命周期

`useRequest` 包装单次请求状态与取消能力，`useFetchList` 在它的基础上增加分页、查询、刷新、更新列表和重置状态。

### Utils 优先处理通用数据转换

`utils` 负责对象路径读写、树处理、查询参数转换、日期数字格式化、复制、文件选择、下载、事件订阅和本地存储。

## 文档工程

本文档是独立 VitePress 工程，位于 `docs`，有自己的 `package.json`、`package-lock.json` 和 VitePress 配置。这样文档依赖不会混入主应用依赖，主工程构建和文档构建互不影响。

文档命令需要在 `docs` 目录执行：

| 命令 | 说明 |
| --- | --- |
| `npm install` | 安装 VitePress 文档依赖。 |
| `npm run dev` | 启动文档开发服务。 |
| `npm run build` | 构建文档站点，输出到 `docs/.vitepress/dist`。 |
| `npm run preview` | 预览已构建文档。 |
