# Vite React Page 文档

这是 `vite-react-page` 的独立 VitePress 文档工程，用于说明主应用的工程框架、路由布局、状态主题、接口约定、页面实现、组件、hooks 和 utils。

文档内容以仓库源码为准，当前重点覆盖：

- docs 独立工程的启动、构建和预览方式。
- 主工程技术栈、Vite 插件、脚本、别名、构建产物和 OpenAPI 生成入口。
- `src` 目录职责、模块边界和跨模块依赖关系。
- `CRouteObject` 路由字段类型、默认行为、使用位置和实际影响。
- 路由格式化、重定向、权限、KeepAlive、菜单、面包屑和布局渲染链路。
- Redux store、theme slice、Provider 挂载与主题切换。
- `src/api`、`openapi-ts.config.ts`、mock 接口的当前状态和使用约定。
- `src/pages/list` 页面的状态、方法、组件、字段类型、数据流、表格列、搜索配置、分页和保存逻辑。

## 快速开始

文档工程位于仓库根目录的 `docs`，依赖与主应用隔离。

```bash
cd docs
npm install
npm run dev
```

常用命令：

| 命令 | 执行目录 | 说明 |
| --- | --- | --- |
| `npm install` | `docs` | 安装文档工程依赖，只写入 `docs/package-lock.json`。 |
| `npm run dev` | `docs` | 启动 VitePress 开发服务。 |
| `npm run build` | `docs` | 构建静态文档站点，输出到 `docs/.vitepress/dist`。 |
| `npm run preview` | `docs` | 本地预览已构建的文档站点。 |

构建与预览示例：

```bash
cd docs
npm run build
npm run preview
```

## 内容入口

- [工程框架](/guide/overview)：项目技术栈、目录结构、路由、布局、状态、接口和构建。
- [页面文档](/pages/list)：现有页面的数据流、交互和扩展方式。
- [组件文档](/components/)：通用组件的 props、行为、使用场景和注意事项。
- [Hooks 文档](/hooks/)：请求、列表、弹窗、订阅和副作用 hooks。
- [Utils 文档](/utils/)：对象、树、日期、数字、查询、复制、存储等工具函数。

## 文档维护原则

- 文档描述以主工程真实实现为准，不把预留能力写成已接入能力。
- 新增页面、组件、hook、工具函数、路由字段、接口生成方式或构建配置时，应同步补充对应章节。
- 页面文档优先说明状态来源、字段类型、方法副作用、数据流和与接口/组件的边界。
- 组件文档优先说明输入、输出、状态变化、默认行为和业务约束，示例代码只保留关键用法。
