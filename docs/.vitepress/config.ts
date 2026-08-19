import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "zh-CN",
  title: "Vite React Page 文档",
  description: "vite-react-page 工程框架、页面、组件、hooks 与 utils 文档",
  base: "/",
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    siteTitle: "Vite React Page",
    nav: [
      { text: "工程", link: "/guide/overview" },
      { text: "页面", link: "/pages/list" },
      { text: "组件", link: "/components/" },
      { text: "Hooks", link: "/hooks/" },
      { text: "Utils", link: "/utils/" },
      { text: "覆盖清单", link: "/audit/coverage" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "工程框架",
          items: [
            { text: "总览", link: "/guide/overview" },
            { text: "目录结构", link: "/guide/structure" },
            { text: "路由与布局", link: "/guide/routing-layout" },
            { text: "状态与主题", link: "/guide/state-theme" },
            { text: "接口与构建", link: "/guide/api-build" },
            { text: "开发约定", link: "/guide/conventions" },
          ],
        },
      ],
      "/pages/": [
        {
          text: "页面",
          items: [{ text: "列表页", link: "/pages/list" }],
        },
      ],
      "/components/": [
        {
          text: "组件",
          items: [
            { text: "组件总览", link: "/components/" },
            { text: "Search", link: "/components/search" },
            { text: "EditTable", link: "/components/edit-table" },
            { text: "AsyncButton", link: "/components/async-button" },
            { text: "CustomModal", link: "/components/custom-modal" },
            { text: "Action", link: "/components/action" },
            { text: "AutoActions", link: "/components/auto-actions" },
            { text: "DropFolderUpload", link: "/components/drop-folder-upload" },
            { text: "UploadSorter", link: "/components/upload-sorter" },
            { text: "LazyLoad", link: "/components/lazy-load" },
            { text: "Loading", link: "/components/loading" },
            { text: "Template", link: "/components/template" },
          ],
        },
      ],
      "/hooks/": [
        {
          text: "Hooks",
          items: [
            { text: "Hooks 总览", link: "/hooks/" },
            { text: "useRequest", link: "/hooks/use-request" },
            { text: "useFetchList", link: "/hooks/use-fetch-list" },
            { text: "useModal", link: "/hooks/use-modal" },
            { text: "useWindowEvent", link: "/hooks/use-window-event" },
            { text: "useConfigurableEffect", link: "/hooks/use-configurable-effect" },
            { text: "useSub", link: "/hooks/use-sub" },
          ],
        },
      ],
      "/utils/": [
        {
          text: "Utils 总览",
          items: [
            { text: "Utils 总览", link: "/utils/" },
            { text: "common/index", link: "/utils/common" },
          ],
        },
        {
          text: "module",
          items: [
            { text: "copy", link: "/utils/module-copy" },
            { text: "date", link: "/utils/module-date" },
            { text: "number", link: "/utils/module-number" },
            { text: "parseQuery", link: "/utils/module-parse-query" },
            { text: "object", link: "/utils/module-object" },
            { text: "path", link: "/utils/module-path" },
            { text: "tree", link: "/utils/module-tree" },
            { text: "storage", link: "/utils/module-storage" },
            { text: "jsencrypt", link: "/utils/module-jsencrypt" },
            { text: "subscribe", link: "/utils/module-subscribe" },
          ],
        },
        {
          text: "组合页",
          items: [
            { text: "对象与树", link: "/utils/object-tree" },
            { text: "格式化、查询与存储", link: "/utils/format-query-storage" },
            { text: "浏览器与通用工具", link: "/utils/browser-common" },
          ],
        },
      ],
      "/audit/": [
        {
          text: "覆盖清单",
          items: [{ text: "文档覆盖清单", link: "/audit/coverage" }],
        },
      ],
    },
    outline: {
      level: [2, 3],
      label: "本页目录",
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    lastUpdatedText: "最后更新",
    search: {
      provider: "local",
    },
  },
});
