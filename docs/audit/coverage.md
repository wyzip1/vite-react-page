# 文档覆盖清单

本清单用于逐项检查源码模块是否有独立、可追踪的文档入口。表格按模块分组，父行可展开或折叠。

状态含义：

| 状态 | 含义 |
| --- | --- |
| 已覆盖 | 有独立文档页，且包含路径、职责、字段类型、默认值、事件/生命周期、边界条件。 |
| 组合页保留 | 保留原组合页作为导航或主题汇总，不作为唯一覆盖依据。 |

<script setup>
const columns = [
  { key: "module", title: "模块", minWidth: 160, maxWidth: 260 },
  { key: "source", title: "源码文件", minWidth: 220, maxWidth: 360 },
  { key: "status", title: "状态", minWidth: 112, maxWidth: 140, align: "center" },
  { key: "check", title: "必查项", minWidth: 360, maxWidth: 560, wrap: true },
];

const rows = [
  {
    id: "components",
    cells: {
      module: "Components",
      source: "src/components/**",
      status: { badge: "分组" },
      check: "组件总览、独立组件文档、组合页保留说明。",
    },
    children: [
      {
        id: "component-search",
        cells: {
          module: { text: "Search", link: "/components/search" },
          source: { code: "src/components/Search/**" },
          status: { badge: "已覆盖" },
          check: "SearchProps、ComOptions、Options、Config、ref、type 映射、RenderItem/RenderRow/mapComponent、日期值转换。",
        },
      },
      {
        id: "component-edit-table",
        cells: {
          module: { text: "EditTable", link: "/components/edit-table" },
          source: { code: "src/components/EditTable/**" },
          status: { badge: "已覆盖" },
          check: "EditTableProps、EditTableColumn、EditTableInstance、valueType、保存/取消/新增、Form.Item name、点路径。",
        },
      },
      {
        id: "component-async-button",
        cells: {
          module: { text: "AsyncButton", link: "/components/async-button" },
          source: { code: "src/components/AsyncButton.tsx" },
          status: { badge: "已覆盖" },
          check: "props、ref、loading 覆盖关系、onClick 无 event、并发边界。",
        },
      },
      {
        id: "component-custom-modal",
        cells: {
          module: { text: "CustomModal", link: "/components/custom-modal" },
          source: { code: "src/components/CustomModal/index.tsx" },
          status: { badge: "已覆盖" },
          check: "CustomModalProps<T>、form/formProps、onConfirm、confirmLoading、关闭重置、onOk 接管。",
        },
      },
      {
        id: "component-action",
        cells: {
          module: { text: "Action", link: "/components/action" },
          source: { code: "src/components/Action/**" },
          status: { badge: "已覆盖" },
          check: "children、btnProps、confirmProps、包装顺序、事件透传。",
        },
      },
      {
        id: "component-auto-actions",
        cells: {
          module: { text: "AutoActions", link: "/components/auto-actions" },
          source: { code: "src/components/AutoActions/index.tsx" },
          status: { badge: "已覆盖" },
          check: "AutoActionsProps、ProxyClickNode、proxyNode、Popover 状态、确认节点代理。",
        },
      },
      {
        id: "component-drop-folder-upload",
        cells: {
          module: { text: "DropFolderUpload", link: "/components/drop-folder-upload" },
          source: { code: "src/components/DropFolderUpload/**" },
          status: { badge: "已覆盖" },
          check: "fileValide、requestApi、内部 fileList、拖拽文件夹、customRequest、浏览器 API。",
        },
      },
      {
        id: "component-upload-sorter",
        cells: {
          module: { text: "UploadSorter", link: "/components/upload-sorter" },
          source: { code: "src/components/UploadSorter/**" },
          status: { badge: "已覆盖" },
          check: "value/onChange、SortableList、SortableItem、SortableOverlay、ImageItem、上传/排序/预览/删除、maxCount 边界。",
        },
      },
      {
        id: "component-lazy-load",
        cells: {
          module: { text: "LazyLoad", link: "/components/lazy-load" },
          source: { code: "src/components/LazyLoad/index.tsx" },
          status: { badge: "已覆盖" },
          check: "ImportValue、createLazyLoad、Suspense fallback、props 不透传。",
        },
      },
      {
        id: "component-loading",
        cells: {
          module: { text: "Loading", link: "/components/loading" },
          source: { code: "src/components/Loading.tsx" },
          status: { badge: "已覆盖" },
          check: "无 props、Spin/LoadingOutlined、父容器高度要求。",
        },
      },
      {
        id: "component-template",
        cells: {
          module: { text: "Template", link: "/components/template" },
          source: { code: "src/components/Template/index.tsx" },
          status: { badge: "已覆盖" },
          check: "Outlet、自动导入依赖、自动路由中间层。",
        },
      },
      {
        id: "component-index",
        cells: {
          module: { text: "组件汇总", link: "/components/" },
          source: { code: "src/components/**" },
          status: { badge: "组合页保留" },
          check: "总览索引，不替代独立文档。",
        },
      },
    ],
  },
  {
    id: "hooks",
    cells: {
      module: "Hooks",
      source: "src/hooks/**",
      status: { badge: "分组" },
      check: "请求、列表、弹窗、事件与副作用 hooks。",
    },
    children: [
      {
        id: "hook-use-request",
        cells: {
          module: { text: "useRequest", link: "/hooks/use-request" },
          source: { code: "src/hooks/useRequest.ts" },
          status: { badge: "已覆盖" },
          check: "泛型、参数、tuple、manual、cancel token、handlerData 当前行为、并发边界。",
        },
      },
      {
        id: "hook-use-fetch-list",
        cells: {
          module: { text: "useFetchList", link: "/hooks/use-fetch-list" },
          source: { code: "src/hooks/useFetchList.ts" },
          status: { badge: "已覆盖" },
          check: "Pagination、List<T>、ItemType<T>、propName、query/body 写入、tuple、manual、updateList 边界。",
        },
      },
      {
        id: "hook-use-modal",
        cells: {
          module: { text: "useModal", link: "/hooks/use-modal" },
          source: { code: "src/hooks/useModal/**" },
          status: { badge: "已覆盖" },
          check: "泛型、ModalWrapperInstance、挂载容器、Promise resolve/reject、Provider 包装、root unmount 边界。",
        },
      },
      {
        id: "hook-use-window-event",
        cells: {
          module: { text: "useWindowEvent", link: "/hooks/use-window-event" },
          source: { code: "src/hooks/useWindowEvent.ts" },
          status: { badge: "已覆盖" },
          check: "事件名泛型、callback 类型、render 阶段注册、无卸载清理、事件名变化边界。",
        },
      },
      {
        id: "hook-use-once-state",
        cells: {
          module: { text: "useOnceState", link: "/hooks/use-once-state" },
          source: { code: "src/hooks/useOnceState.ts" },
          status: { badge: "已覆盖" },
          check: "callback、Location.state、history.state.usr、一次性消费、SSR 边界。",
        },
      },
      {
        id: "hook-use-un-first-effect",
        cells: {
          module: { text: "useUnFirstEffect", link: "/hooks/use-un-first-effect" },
          source: { code: "src/hooks/useUnFirstEffect.ts" },
          status: { badge: "已覆盖" },
          check: "cb/deps 类型、跳过首次、cleanup 不生效、依赖完整性。",
        },
      },
      {
        id: "hook-use-sub",
        cells: {
          module: { text: "useSub", link: "/hooks/use-sub" },
          source: { code: "src/hooks/useSub.ts" },
          status: { badge: "已覆盖" },
          check: "EventItem、globalEvents、dispatchSubEvents、注册/清理、同步派发、异常边界。",
        },
      },
      {
        id: "hook-index",
        cells: {
          module: { text: "Hooks 汇总", link: "/hooks/" },
          source: { code: "src/hooks/**" },
          status: { badge: "组合页保留" },
          check: "总览索引，不替代独立文档。",
        },
      },
    ],
  },
  {
    id: "utils",
    cells: {
      module: "Utils",
      source: "src/utils/**",
      status: { badge: "分组" },
      check: "入口与 module 子文档。",
    },
    children: [
      {
        id: "util-common",
        cells: {
          module: { text: "common/index", link: "/utils/common" },
          source: { code: "src/utils/index.ts" },
          status: { badge: "已覆盖" },
          check: "入口导出、guid、debounce、throttle、toggleList、selectFile、downloadArraybufferFile、sleep。",
        },
      },
      {
        id: "util-copy",
        cells: {
          module: { text: "copy", link: "/utils/module-copy" },
          source: { code: "src/utils/module/copy.ts" },
          status: { badge: "已覆盖" },
          check: "createImg、copyToEl、copyText、copyImg、copyInfo、clipboard 权限、DOM 副作用。",
        },
      },
      {
        id: "util-date",
        cells: {
          module: { text: "date", link: "/utils/module-date" },
          source: { code: "src/utils/module/date.ts" },
          status: { badge: "已覆盖" },
          check: "parseDateFormatSetting、formatDate、token 规则、无效日期边界。",
        },
      },
      {
        id: "util-number",
        cells: {
          module: { text: "number", link: "/utils/module-number" },
          source: { code: "src/utils/module/number.ts" },
          status: { badge: "已覆盖" },
          check: "formatNum、formatMutipleNum、formatMoneyPreSubFix、rangeNum、拼写按源码保留。",
        },
      },
      {
        id: "util-parse-query",
        cells: {
          module: { text: "parseQuery", link: "/utils/module-parse-query" },
          source: { code: "src/utils/module/parseQuery.ts" },
          status: { badge: "已覆盖" },
          check: "transferDataToQuery、parseJSON、transferStringListToData、transferQueryToData、getCookie、URL 编码边界。",
        },
      },
      {
        id: "util-object",
        cells: {
          module: { text: "object", link: "/utils/module-object" },
          source: { code: "src/utils/module/object.ts" },
          status: { badge: "已覆盖" },
          check: "getValue、setValue、filterObjEmpty、是否修改入参、点路径边界。",
        },
      },
      {
        id: "util-path",
        cells: {
          module: { text: "path", link: "/utils/module-path" },
          source: { code: "src/utils/module/path.ts" },
          status: { badge: "已覆盖" },
          check: "Path<T>、Primitive、数组/元组路径、运行时无产物。",
        },
      },
      {
        id: "util-tree",
        cells: {
          module: { text: "tree", link: "/utils/module-tree" },
          source: { code: "src/utils/module/tree.ts" },
          status: { badge: "已覆盖" },
          check: "assembleTree、eachTree、formatTree、findTreePath、是否修改节点。",
        },
      },
      {
        id: "util-storage",
        cells: {
          module: { text: "storage", link: "/utils/module-storage" },
          source: { code: "src/utils/module/storage.ts" },
          status: { badge: "已覆盖" },
          check: "Storage 类、默认实例、namespace、encrypt、get/set/remove/clear、副作用。",
        },
      },
      {
        id: "util-jsencrypt",
        cells: {
          module: { text: "jsencrypt", link: "/utils/module-jsencrypt" },
          source: { code: "src/utils/module/jsencrypt.ts" },
          status: { badge: "已覆盖" },
          check: "encrypt、decrypt、encryptLong、decryptLong、分段符、前端内置密钥风险。",
        },
      },
      {
        id: "util-subscribe",
        cells: {
          module: { text: "subscribe", link: "/utils/module-subscribe" },
          source: { code: "src/utils/module/subscribe.ts" },
          status: { badge: "已覆盖" },
          check: "events、subEvent、removeEvent、triggerEvent、取消订阅边界。",
        },
      },
      {
        id: "util-index",
        cells: {
          module: { text: "Utils 汇总", link: "/utils/" },
          source: { code: "src/utils/**" },
          status: { badge: "组合页保留" },
          check: "总览索引，不替代 module 独立文档。",
        },
      },
    ],
  },
];
</script>

<DocTable :columns="columns" :rows="rows" />

## 可折叠表格约定

文档中存在父子关系的数据时，优先使用 `DocTable`。数据结构：

```ts
const columns = [
  { key: "module", title: "模块", minWidth: 160, maxWidth: 260 },
  { key: "source", title: "源码文件", minWidth: 220, maxWidth: 360 },
  { key: "check", title: "说明", minWidth: 320, maxWidth: 560, wrap: true },
];

const rows = [
  {
    id: "parent",
    cells: { module: "父模块", source: "src/**" },
    children: [
      {
        id: "child",
        cells: {
          module: { text: "子模块", link: "/components/search" },
          source: { code: "src/components/Search/**" },
        },
      },
    ],
  },
];
```

`ExpandableTable` 仍可作为兼容别名使用，但新文档优先使用 `DocTable`。单元格支持普通字符串、链接、代码和 badge：

```ts
{ text: "Search", link: "/components/search" }
{ code: "src/components/Search/**" }
{ badge: "已覆盖" }
```

## 复查规则

每次新增或修改组件、hook 或 utils module 时，需要同步执行：

1. 在本清单增加或更新对应行。
2. 确认侧边栏有独立入口。
3. 文档必须包含字段类型、必填性、默认值、返回值或 ref 方法。
4. 文档必须描述事件流、生命周期或副作用。
5. 文档必须写明当前实现边界，不能把未实现能力写成已实现。
