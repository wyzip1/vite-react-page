# 目录结构

## 根目录

```text
.
├── config/                  # TypeScript 与环境类型配置
├── docs/                    # 独立 VitePress 文档工程
├── dist/                    # 主应用 Vite 构建产物目录
├── dist2/                   # build-ftl 生成的 FTL 产物目录
├── mock/                    # mock 接口
├── node_modules/            # 主应用依赖安装目录
├── src/                     # 主应用源码
├── auto-imports.d.ts        # unplugin-auto-import 生成的自动导入类型声明
├── index.html               # Vite HTML 入口
├── openapi-ts.config.ts     # OpenAPI 生成配置
├── package.json             # 主应用依赖与脚本
├── package-lock.json        # 主应用 npm 锁文件
├── tailwind.config.js       # Tailwind 配置
├── tsconfig.json            # TS 编译配置
└── vite.config.ts           # Vite 配置
```

根目录主工程负责运行和构建业务应用。`docs` 是独立文档工程，除阅读源码外，不直接编译或运行 `src` 代码。

## src 目录

```text
src
├── api/                     # 接口封装与请求客户端配置
├── components/              # 可复用业务组件
├── hooks/                   # 请求、弹窗、事件、副作用等 hooks
├── layout/                  # 管理端布局、菜单、面包屑
├── pages/                   # 页面模块
├── router/                  # 路由配置、格式化、权限和 KeepAlive
├── store/                   # Redux store 与主题状态
├── styles/                  # 全局与页面样式
├── types/                   # 通用类型
└── utils/                   # 工具函数
```

## src 模块职责

| 模块 | 主要文件 | 职责 | 对外边界 |
| --- | --- | --- | --- |
| `api` | `config.ts`、`index.ts` | 提供 axios 实例、请求/响应拦截、响应类型、mock 列表接口。 | 页面和 hooks 只调用导出的接口函数，不直接拼接底层 axios 配置。 |
| `components` | `Search`、`EditTable`、`AsyncButton`、`CustomModal`、`LazyLoad` 等 | 可复用 UI 与业务组件，封装表单、表格、异步按钮、弹窗、上传、懒加载。 | 组件通过 props/ref/callback 暴露能力，不持有页面私有接口逻辑。 |
| `hooks` | `useRequest`、`useFetchList`、`useModal` 等 | 请求生命周期、分页查询、弹窗挂载、事件和副作用控制。 | hook 只处理状态和副作用，UI 由页面或组件渲染。 |
| `layout` | `index.tsx`、`components/MenuList.tsx`、`components/Breadcrumb.tsx` | 管理端外壳，包含侧栏、顶部栏、面包屑、主题切换和内容出口。 | 读取路由元信息和主题状态，不写页面业务数据。 |
| `pages` | `list/App.tsx`、`list/main.tsx`、`list/router/index.tsx` | 页面编排、页面级状态、接口入参整理、页面入口和页面私有路由。 | 可复用能力下沉到 `components`、`hooks`、`utils`。 |
| `router` | `routes.tsx`、`autoRoutes.tsx`、`utils.tsx`、`components/*` | 路由声明/自动生成、格式化、重定向、权限包装、KeepAlive。 | 只处理路由结构和元信息，不直接管理业务列表数据。 |
| `store` | `index.ts`、`theme.ts`、`RouterProvider/*` | Redux store、theme slice、路由上下文 Provider。 | 全局状态集中管理，页面临时状态留在页面或 hook。 |
| `styles` | `index.css`、`MainStyled.ts`、`AppStyled.tsx` | 全局样式、根容器样式、页面通用样式。 | 样式 token 从主题和 Ant Design token 读取，避免写业务逻辑。 |
| `types` | `index.ts` | 全局共享类型，目前包含 `SortType<T>` 和 `CRouteObject`。 | 模块私有类型优先靠近模块文件。 |
| `utils` | `module/*`、`index.ts` | 对象路径读写、树遍历、日期/数字/查询参数、复制、存储、订阅等工具。 | 优先保持低耦合，避免依赖 React 组件状态。 |

## docs 目录

```text
docs
├── .vitepress/
│   ├── config.ts            # VitePress 站点配置
│   └── theme/               # 默认主题扩展与样式
├── components/              # 组件文档
├── guide/                   # 工程框架文档
├── hooks/                   # hooks 文档
├── pages/                   # 页面文档
├── utils/                   # utils 文档
├── index.md                 # 文档首页
└── package.json             # 文档工程独立依赖
```

文档站点配置位于 `docs/.vitepress/config.ts`，当前导航包含工程、页面、组件、Hooks 和 Utils。`docs/package.json` 的脚本只服务文档工程：

| 脚本 | 命令 | 构建产物 |
| --- | --- | --- |
| `dev` | `vitepress dev .` | 启动本地开发服务，无静态产物。 |
| `build` | `vitepress build .` | 输出到 `docs/.vitepress/dist`。 |
| `preview` | `vitepress preview .` | 预览 `docs/.vitepress/dist`。 |

## 模块边界

| 模块 | 主要职责 | 不建议放入 |
| --- | --- | --- |
| `pages` | 页面编排、业务状态连接、接口参数整理 | 可复用 UI 逻辑和跨页面工具函数 |
| `components` | 可复用视图组件和业务组件 | 页面私有接口请求、路由跳转细节 |
| `hooks` | 状态、副作用、请求生命周期封装 | 具体 UI 渲染结构 |
| `utils` | 纯函数或浏览器工具 | React 状态和组件 JSX |
| `router` | 路由结构和路由增强 | 页面业务逻辑 |
| `store` | 全局状态 | 临时页面状态 |

当前 `src/pages/list/App.tsx` 是模块边界示例：页面只维护 `searchFormData`、组装 `searchParams`、调用 `fetchMockList` 和 `useFetchList`，表单/表格/弹窗交互分别交给 `Search`、`EditTable`、`useModal`、`CustomModal`。

## 引用约定

主工程配置了 `@` 指向 `src`，因此源码中优先使用：

```ts
import Search from "@/components/Search";
import useFetchList from "@/hooks/useFetchList";
import { getValue } from "@/utils";
```

文档工程不直接编译主应用代码，只描述主应用结构和使用方式。

## TypeScript 配置

根目录 `tsconfig.json` 继承 `config/path.tsconfig.json`，其中 `@/*` 映射到 `src/*`。关键编译选项如下：

| 配置 | 当前值 | 说明 |
| --- | --- | --- |
| `module` | `esnext` | 使用 ES module 输出。 |
| `moduleResolution` | `bundler` | 适配 Vite/bundler 解析规则。 |
| `types` | `["vite/client", "@tailwindcss/vite"]` | 注入 Vite 和 Tailwind Vite 插件类型。 |
| `strict` | `true` | 开启严格类型检查。 |
| `noImplicitAny` | `false` | 允许隐式 `any`，因此页面中仍有部分宽松类型。 |
| `noUnusedLocals` | `true` | 未使用局部变量会报错。 |
| `jsx` | `react-jsx` | 使用 React 17+ JSX transform。 |
| `target` | `ES2016` | TS 编译目标为 ES2016。 |
