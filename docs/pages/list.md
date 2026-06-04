# 列表页

列表页主体位于 `src/pages/list/App.tsx`。在主工程路由中访问路径为 `/list`；手写路由标题是 `mock列表`，并启用 `keepAlive`。当前主路由入口使用 `autoRoutes`，自动路由会扫描该页面并默认 `keepAlive: true`，但标题会回退为路径片段 `list`，除非页面模块显式导出 `title`。

页面还包含多页入口：

| 文件 | 职责 |
| --- | --- |
| `src/pages/list/App.tsx` | 页面主体，包含搜索、按钮、弹窗、可编辑表格和数据流。 |
| `src/pages/list/main.tsx` | list 页独立入口，挂载 Provider、AntConfigProvider、KeepAliveProvider、CRouterProvider。 |
| `src/pages/list/router/index.tsx` | list 页私有 hash router，根路径重定向到 `/list`，`/list` 渲染同一个 `App`。 |

## 页面职责

该页面演示管理端列表工作流：

- 使用 `Search` 配置姓名和时间范围查询条件。
- 使用 `formatSearchParams` 把页面搜索状态整理成接口 body。
- 使用 `useFetchList(fetchMockList, searchParams)` 请求 mock 列表并管理分页。
- 使用 `EditTable` 展示列表、进入编辑态、新增行、校验和保存行。
- 使用 `AsyncButton` 处理异步按钮 loading。
- 使用 `useModal(TestModal)` 打开 `CustomModal`。
- 使用 `useThemeMode` 在弹窗包装组件中读取当前亮暗主题。

## 相关类型

### SearchFormData

页面内部定义：

```ts
interface SearchFormData {
  date?: [string, string];
  name?: string;
}
```

| 字段 | 类型 | 来源 | 说明 |
| --- | --- | --- | --- |
| `name` | `string \| undefined` | `Search` 的姓名输入框 | 传入 mock 接口后按姓名包含关系过滤。 |
| `date` | `[string, string] \| undefined` | `Search` 的 `dateRange` 组件 | 页面会拆成 `deliveryTimeBegin`、`deliveryTimeEnd`，但当前 `fetchMockList`/mock 接口没有声明和使用这两个字段。 |

### MockListItem

接口类型来自 `src/api/index.ts`：

| 字段 | 类型 | 是否必填 | 页面使用 |
| --- | --- | --- | --- |
| `id` | `number` | 是 | `EditTable rowKey="id"`，保存时用于判断更新还是新增。 |
| `name` | `string` | 是 | 搜索、表格姓名列、编辑必填校验。 |
| `sex` | `number` | 是 | 性别列展示，`0` 显示女，`1` 显示男，其他显示未知。 |
| `desc` | `string` | 是 | 描述列展示/编辑。 |
| `data` | `{ money: number }` | 是 | 钱包列通过 `data.money` 读取嵌套金额。 |
| `test` | `any` | 否 | test 下拉列使用，选项值为 `1` 或 `2`。 |
| `date` | `string` | 否 | 日期列展示/编辑，格式为 `YYYY-MM-DD HH:mm:ss`。 |
| `dateRange` | `[string, string]` | 否 | 日期范围列展示/编辑，展示时用 `join(" - ")`。 |

### MockListParams

```ts
export interface MockListParams extends Pagination {
  name?: string;
}
```

| 字段 | 类型 | 来源 | 说明 |
| --- | --- | --- | --- |
| `pageNum` | `number` | `useFetchList` 写入 | 当前页码。 |
| `pageSize` | `number` | `useFetchList` 写入 | 每页条数。 |
| `name` | `string \| undefined` | `formatSearchParams` 保留 | 姓名筛选。 |

## 页面状态

`App` 内部状态和 ref：

| 名称 | 类型 | 初始值 | 更新位置 | 影响 |
| --- | --- | --- | --- | --- |
| `searchFormData` | `SearchFormData` | `{}` | `Search.onChange` 调用 `setSearchFormData`。 | 页面搜索表单原始状态。 |
| `searchParams` | `{ body: { name?: string; deliveryTimeBegin?: string; deliveryTimeEnd?: string } }` | 由 `searchFormData` 计算 | `useMemo(() => formatSearchParams(searchFormData), [searchFormData])`。 | 传给 `useFetchList`，最终作为 `fetchMockList` 的请求 body 基础。 |
| `setPageInfo` | `(pageOptions: Pagination) => ReturnType<typeof fetchMockList>` | `useFetchList` 返回 | `EditTable.onChange` 调用。 | 修改页码/页大小并触发请求。 |
| `state` | `{ pageNum: number; pageSize: number; total: number; loading: boolean; list: MockListItem[] }` | `useFetchList` 返回 | 请求成功、分页变化、`api.updateList`。 | 驱动表格数据、分页和 loading。 |
| `api` | `{ doSearch; updateList; refreshList; resetState }` | `useFetchList` 返回 | 页面事件调用。 | 提供查询、刷新、局部更新和重置能力。 |
| `openModal` | `(props: CustomModalProps<any>) => void` | `useModal(TestModal)` 返回 | Test 按钮点击。 | 命令式打开 `TestModal`。 |
| `eidtTableRef` | `React.RefObject<EditTableInstance>` | `null` | 传给 `EditTable ref`。 | “添加数据”按钮调用 `addEditItem()`。变量名源码拼写为 `eidtTableRef`。 |

## 搜索配置

`searchOptions` 类型为 `Config`，即 `Options[][]`。外层数组表示行，内层数组表示该行字段。

```ts
const searchOptions: Config = [
  [
    { label: "姓名", key: "name", props: { allowClear: true } },
    { label: "时间", key: "date", type: "dateRange", props: { showTime: true } },
  ],
];
```

| 字段 | 配置类型 | key | 值类型 | 组件类型 | props | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| 姓名 | `inputOptions` | `name` | `string \| undefined` | 默认 `input` | `{ allowClear: true }` | 未写 `type`，`Search` 的 `initComponentList` 会补为 `input`。 |
| 时间 | `dateRangeProps` | `date` | `[string, string] \| undefined` | `dateRange` | `{ showTime: true }` | 日期范围选择器，值传入页面后拆成开始/结束时间。 |

传给 `Search` 的 props：

| prop | 类型 | 当前值 | 影响 |
| --- | --- | --- | --- |
| `defaultLabelWidth` | `number \| string` | `100` | 标签宽度会转为 `100px`。 |
| `loading` | `boolean` | `state.loading` | 查询/重置按钮 loading。 |
| `config` | `Config` | `searchOptions` | 渲染搜索项。 |
| `onChange` | `(state: State) => void` | `setSearchFormData` | 搜索表单任意值变化后更新页面状态。 |
| `onSearch` | `(state: State) => void` | `() => api.doSearch()` | 点击查询时触发列表查询，必要时先回到第 1 页。 |
| `onReset` | `(state: State) => void` | 自定义函数 | 重置表单后用初始状态重算参数并查询。 |

重置逻辑：

```ts
onReset={state => {
  Object.assign(searchParams, formatSearchParams(state));
  api.doSearch();
}}
```

这里会直接修改当前 `searchParams` 对象，再调用 `api.doSearch()`。这是为了在 `setSearchFormData` 的异步更新完成前，让本次查询能拿到重置后的参数。

## 参数格式化

```ts
function formatSearchParams(data: SearchFormData) {
  const { date, ...params } = data;
  const [deliveryTimeBegin, deliveryTimeEnd] = date || [];
  return {
    body: {
      ...params,
      deliveryTimeBegin,
      deliveryTimeEnd,
    },
  };
}
```

输入输出：

| 输入字段 | 输出字段 | 类型 | 说明 |
| --- | --- | --- | --- |
| `name` | `body.name` | `string \| undefined` | 透传给接口。 |
| `date[0]` | `body.deliveryTimeBegin` | `string \| undefined` | 当前 mock 不使用。 |
| `date[1]` | `body.deliveryTimeEnd` | `string \| undefined` | 当前 mock 不使用。 |

`axiosInstance` 请求拦截器会对 body 调用 `filterObjEmpty`，空值会在发送前被过滤。

## 列表请求与分页

页面调用：

```ts
const [setPageInfo, state, api] = useFetchList(fetchMockList, searchParams);
```

`useFetchList` 默认配置：

| 配置 | 默认值 | 当前页面 |
| --- | --- | --- |
| `pageNum` 初始值 | `1` | 使用默认值。 |
| `pageSize` 初始值 | `defaultOptions.pageSize || 10` | 使用默认 `10`。 |
| `manual` | `false` | 组件首次挂载后自动请求。 |
| 分页字段名 | `pageNum`、`pageSize` | 写入 `body.pageNum`、`body.pageSize`。 |
| 列表字段名 | `list` | 从响应 `data.list` 读取。 |
| 总数字段名 | `total` | 从响应 `data.total` 读取。 |

`state` 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `pageNum` | `number` | 当前页码。 |
| `pageSize` | `number` | 当前每页条数。 |
| `total` | `number` | 响应 `data.total`，没有数据时为 `0`。 |
| `loading` | `boolean` | `useRequest` 请求中状态。 |
| `list` | `MockListItem[]` | 响应 `data.list`，没有数据时为空数组。 |

`api` 方法：

| 方法 | 类型 | 行为 |
| --- | --- | --- |
| `doSearch` | `() => ReturnType<typeof fetchMockList>` | 如果当前是第 1 页，直接请求；否则先把页码改成 1，再由 effect 触发请求。 |
| `updateList` | `(callback?: (list: MockListItem[]) => void) => void` | 基于现有响应数据浅拷贝触发状态更新，可选 callback 修改列表。 |
| `refreshList` | `() => ReturnType<typeof fetchMockList>` | 使用当前页码和页大小重新请求。 |
| `resetState` | `() => void` | 页码恢复 1、页大小恢复默认值、清空响应数据。当前页面没有调用。 |

`EditTable.onChange` 处理分页：

```ts
onChange={({ current, pageSize }) => {
  setPageInfo({ pageNum: current!, pageSize: pageSize! });
}}
```

分页配置：

| 字段 | 当前值 | 说明 |
| --- | --- | --- |
| `current` | `state.pageNum` | 当前页码。 |
| `pageSize` | `state.pageSize` | 当前每页条数。 |
| `total` | `state.total` | 总条数。 |
| `pageSizeOptions` | `["10", "20", "30"]` | 可选每页条数。 |
| `showPrevNextJumpers` | `true` | 显示上一组/下一组跳转。 |
| `showQuickJumper` | `true` | 显示快速跳页。 |
| `showSizeChanger` | `true` | 显示页大小切换。 |
| `showTotal` | `total => \`共 ${total} 条\`` | 总数文案。 |

`EditTable` 内部在存在编辑中行时会把 pagination 置为 `false`，避免编辑态下翻页导致数据丢失。

## 表格列

`columns` 类型为 `EditTableColumn<any>[]`。表格开启：

| prop | 当前值 | 说明 |
| --- | --- | --- |
| `tableLayout` | `"fixed"` | 固定表格布局。 |
| `bordered` | `true` | 显示边框。 |
| `className` | `"mt-4"` | Tailwind 上边距。 |
| `loading` | `state.loading` | 请求中表格 loading。 |
| `dataSource` | `state.list` | 当前页数据。 |
| `defaultEmptyColumn` | `<div>暂无数据</div>` | 列没有值且没有自定义 `empty` 时的空展示。 |
| `rowKey` | `"id"` | 行 key。 |
| `scroll.x` | `columns.reduce((c, i) => c + ((i.width as number) || 125), 0)` | 根据列宽估算横向滚动宽度，未设置宽度的列按 125 计算。 |

列详情：

| 标题 | `dataIndex` | `valueType` | 值类型 | 编辑控件/配置 | 展示逻辑 |
| --- | --- | --- | --- | --- | --- |
| 姓名 | `name` | `string` | `string` | 输入框；`formItemProps.rules` 要求必填，提示 `请输入姓名`。 | 默认显示字段值。 |
| 性别 | `sex` | `boolean` | `number` | boolean 编辑控件，具体渲染由 `EditTable` 的 `renderEditContent` 决定。 | `render(v)` 将 `0` 转女、`1` 转男、其他转未知。 |
| test | `test` | `select` | `any` | Select，选项为 `{ label: "name1", value: 1 }`、`{ label: "name2", value: 2 }`。 | 非编辑态下 `EditTable.formatValue` 会把 select value 转成 label。 |
| 日期 | `date` | `date` | `string \| undefined` | DatePicker，`format: "YYYY-MM-DD HH:mm:ss"`，`showTime: true`，宽度 `240`。 | 默认显示字段值。编辑保存时 dayjs 会按 format 转成字符串。 |
| 日期范围 | `dateRange` | `dateRange` | `[string, string] \| undefined` | RangePicker，`format: "YYYY-MM-DD HH:mm:ss"`，`showTime: true`，宽度 `480`。 | `render: v => v?.join(" - ")`。编辑保存时转成字符串数组。 |
| 钱包 | `data.money` | `number` | `number` | InputNumber，`precision: 2`。 | 通过路径读取嵌套金额。 |
| 描述 | `desc` | `string` | `string` | 输入框。 | 默认显示字段值。 |
| empty | 未设置 | 未设置 | 无 | 不可编辑。 | 没有值时显示列级 `empty: "-"`。 |
| defaultEmpty | 未设置 | 未设置 | 无 | 不可编辑。 | 没有值时显示 `defaultEmptyColumn`，即 `暂无数据`。 |
| 操作 | 未设置 | `action` | 无 | 编辑态显示保存/取消。 | 非编辑态将 `edit` 按钮透传给 `render`，页面直接返回它。 |

## 表格编辑流程

`EditTable` 暴露的 ref 类型：

```ts
export interface EditTableInstance<T = unknown> {
  editRecords: Record<string, Partial<T>>;
  addEditItem: () => void;
  startEditItem: (key: React.Key) => void;
  cancelEditItem: (key: React.Key) => void;
}
```

页面使用：

| 操作 | 触发位置 | 行为 |
| --- | --- | --- |
| 新增 | “添加数据”按钮 | `eidtTableRef.current?.addEditItem()`，调用 `createEditRecord()` 生成默认编辑行。 |
| 编辑 | 操作列的“编辑”按钮 | `EditTable.startEditItem(rowKey)`，复制当前行到 `editRecords`。 |
| 保存 | 编辑态的“保存”按钮 | 先 `form.validateFields()`，再调用 `onSaveRecord`。 |
| 取消 | 编辑态的“取消”按钮 | 删除对应 `editRecords[key]`，退出编辑态。 |

新增默认值：

```ts
createEditRecord={() => ({
  id: -1,
  name: "test-add",
})}
```

新增行在保存前只存在于 `EditTable` 的 `editRecords` 中。由于默认 `id` 是 `-1`，保存后会作为新记录 push 到当前页内存列表。

## 保存逻辑

页面保存函数：

```ts
function saveRecord(data: any) {
  const idx = state.list.findIndex(i => i.id === data.id);
  if (idx > -1) state.list[idx] = data;
  else state.list.push(data);
  api.updateList();
}
```

行为说明：

- 根据 `id` 在当前 `state.list` 中查找。
- 找到则替换当前页数组中的记录。
- 找不到则 push 到当前页数组。
- 调用 `api.updateList()` 触发列表状态浅拷贝更新。
- 不会调用后端保存接口，也不会更新 mock 源数据；刷新或重新查询后会回到 mock 接口返回的数据。

注意：这里直接修改了 `state.list` 数组，再通过 `updateList` 触发 setData。它能满足当前 demo，但如果接入真实接口，建议改成先调用保存 API，再 `refreshList()`。

## 顶部按钮和弹窗

按钮区：

| 组件 | 文案 | 行为 |
| --- | --- | --- |
| `AsyncButton` | 导出 | 当前没有传 `onClick`，只展示按钮。 |
| `Button` | 添加数据 | 调用 `eidtTableRef.current?.addEditItem()`。 |
| `AsyncButton` | Test | 打开 `TestModal`。 |

`TestModal`：

```ts
const TestModal: React.FC<CustomModalProps<any>> = props => {
  const themeMode = useThemeMode();

  useEffect(() => {
    console.log("themeMode", themeMode);
  }, [themeMode]);

  return <CustomModal {...props} />;
};
```

打开方式：

```ts
openModal({
  title: "哈哈哈",
  onConfirm: () => new Promise(rev => setTimeout(rev, 1000)),
});
```

`onConfirm` 返回 Promise，`CustomModal` 可据此展示确认中的 loading。`TestModal` 读取主题只是演示 Provider 链路可用，业务上没有改变弹窗内容。

## 完整数据流

首次进入：

```text
App mount
  -> searchFormData = {}
  -> searchParams = { body: { deliveryTimeBegin: undefined, deliveryTimeEnd: undefined } }
  -> useFetchList effect
  -> onSearch(1, 10)
  -> fetchMockList({ body: { pageNum: 1, pageSize: 10 } })
  -> axiosInstance POST /developmentApi/api/list
  -> mock 返回 { list, total }
  -> state.list/state.total 更新
  -> EditTable 渲染
```

查询：

```text
Search item onChange
  -> setSearchFormData
  -> searchParams 重新计算
  -> 点击 查询
  -> api.doSearch()
  -> 页码是 1 则直接请求，否则先 setPageInfo({ pageNum: 1 })
  -> fetchMockList
  -> state 更新
```

分页：

```text
EditTable pagination onChange
  -> setPageInfo({ pageNum: current, pageSize })
  -> useFetchList effect
  -> searchParams.body 合并 pageNum/pageSize
  -> fetchMockList
  -> state 更新
```

保存：

```text
点击 编辑/添加数据
  -> EditTable editRecords 写入编辑行
  -> 输入控件 onChange 更新 editRecords
  -> 点击 保存
  -> form.validateFields()
  -> onSaveRecord(editRecord)
  -> saveRecord 更新 state.list
  -> api.updateList() 触发渲染
  -> cancelEditItem 退出编辑态
```

## 与 mock 接口的边界

当前 mock 接口只处理：

- `body.pageNum`
- `body.pageSize`
- `body.name`

页面会提交但 mock 不处理：

- `body.deliveryTimeBegin`
- `body.deliveryTimeEnd`

因此时间范围搜索当前不会影响结果。若要接入真实接口，需要在 `MockListParams`、`fetchMockList` 入参、后端/mock 处理逻辑中补齐这两个字段。
