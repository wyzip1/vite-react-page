# EditTable

`EditTable` 位于 `src/components/EditTable`，职责是在 Ant Design `Table` 上增加行编辑、新增临时行、保存校验、编辑控件映射和点路径字段读写。实现文件包括：

| 文件 | 职责 |
| --- | --- |
| `src/components/EditTable/index.tsx` | 主组件、编辑态记录、表格列渲染、保存/取消/新增/ref。 |
| `src/components/EditTable/types.ts` | `EditTableProps`、`EditTableColumn`、`EditTableInstance`、`valueType` 类型。 |
| `src/components/EditTable/renderEditContent.tsx` | 根据 `valueType` 渲染编辑控件，并统一处理 change/blur。 |

## 基础用法

```tsx
import EditTable from "@/components/EditTable";
import type { EditTableColumn, EditTableInstance } from "@/components/EditTable/types";

const tableRef = useRef<EditTableInstance<User>>(null);

const columns: EditTableColumn<User>[] = [
  {
    title: "姓名",
    dataIndex: "name",
    valueType: "string",
    formItemProps: {
      rules: [{ required: true, message: "请输入姓名" }],
    },
  },
  {
    title: "余额",
    dataIndex: "account.money",
    valueType: "number",
    valueProps: { precision: 2 },
    empty: "-",
  },
  {
    title: "操作",
    valueType: "action",
    render: edit => edit,
  },
];

<EditTable
  ref={tableRef}
  rowKey="id"
  dataSource={list}
  columns={columns}
  defaultEmptyColumn="-"
  createEditRecord={() => ({ name: "", account: { money: 0 } })}
  onSaveRecord={record => saveRecord(record)}
/>;
```

## Props

`EditTableProps<T>` 继承 `Omit<TableProps<T>, "columns">`，因此除 `columns` 外的 Ant Design `Table` props 都会透传给内部 `Table`。

| 字段 | 类型 | 必填 | 默认值 | 透传关系与说明 |
| --- | --- | --- | --- | --- |
| `columns` | `EditTableColumn<T>[]` | 是 | 无 | 可编辑列配置。组件会为每列重写 `render`。 |
| `defaultEmptyColumn` | `React.ReactNode` | 否 | `undefined` | 展示态空值兜底。 |
| `dataSource` | `T[]` | 否 | `undefined` | 继承自 `TableProps`，和新增临时编辑行合并后传给 `Table`。 |
| `createEditRecord` | `() => Partial<T>` | 否 | `undefined` | `addEditItem()` 新增临时行时调用；未传时 `addEditItem` 直接返回。 |
| `onSaveRecord` | `(record: T) => any` | 否 | `undefined` | 保存按钮校验通过后调用；支持 Promise，完成后退出编辑态。 |
| `rowKey` | `TableProps<T>["rowKey"]` | 否 | `"id"` | 代码按字符串路径使用；当前实现通过 `record[rowKey]` 读写。 |
| 其他 `TableProps` | 对应 Ant Design 类型 | 否 | Ant Design 默认值 | 透传给内部 `Table`，但 `rowKey`、`dataSource`、`columns`、`pagination`、`tableLayout` 会被组件自己的值覆盖或重写。 |

内部 `Table` 固定传入 `tableLayout="fixed"`，再展开 `props`，最后再次传入 `rowKey/dataSource/columns/pagination`。因此调用方可以通过 props 覆盖 `tableLayout`，但不能覆盖组件最终计算出的 `rowKey/dataSource/columns/pagination`。

## Ref 与实例方法

`EditTable` 通过 `forwardRef` 暴露 `EditTableInstance<T>`。

| 字段/方法 | 类型 | 说明 |
| --- | --- | --- |
| `editRecords` | `Record<string, Partial<T>>` | 当前编辑态记录。key 是行 `rowKey` 的字符串形式或新增行的 `guid()`。 |
| `addEditItem()` | `() => void` | 如果存在 `createEditRecord`，使用 `guid()` 生成临时 key，并把新编辑行插到已有数据前面。 |
| `startEditItem(key)` | `(key: React.Key) => void` | 从当前 `dataList` 找到对应记录，深拷贝后放入 `editRecords`，并在副作用中回填表单字段。 |
| `cancelEditItem(key)` | `(key: React.Key) => void` | 从 `editRecords` 删除对应记录，退出编辑态。 |

## 列配置

`EditTableColumn<T>` 在 Ant Design `TableColumnProps<T>` 基础上扩展，并重新定义了 `dataIndex` 与 `render`。

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `title`、`width` 等表格列字段 | `TableColumnProps<T>` 对应类型 | 否 | Ant Design 默认值 | 除 `dataIndex/render` 外继续透传给表格列。 |
| `dataIndex` | `Path<T>` | 非 action 列通常需要 | `undefined` | 支持点路径，如 `data.money`；编辑写回依赖 `setValue`。 |
| `renderIndex` | `Path<T>` | 否 | `undefined` | 展示态读取路径。存在时优先读取 `renderIndex`，否则读取 `dataIndex`。 |
| `valueType` | 见下方枚举 | 否 | `undefined` | 存在时该列在编辑态渲染编辑控件；`"action"` 是操作列。 |
| `valueProps` | 按 `valueType` 匹配的 Ant Design props | 否 | `undefined` | 透传给编辑控件。保存日期时也读取其中的 `format`。 |
| `formItemProps` | `FormItemProps` | 否 | `undefined` | 透传给包裹编辑控件的 `Form.Item`，常用于 `rules`。 |
| `empty` | `React.ReactNode` | 否 | `undefined` | 当前列空值兜底，优先级高于 `defaultEmptyColumn`。 |
| `customEdit` | `(props: { value?: any; onChange?: (v: any) => void }) => JSX.Element` | 否 | `undefined` | 自定义编辑控件。当前实现以 `<column.customEdit />` 渲染，没有传入 value/onChange。 |
| `render` | 非 action：`TableColumnProps<T>["render"]`；action：`(editDom, value, record, index) => JSX.Element` | 否 | `undefined` | 展示态渲染函数。action 列第一个参数是默认编辑按钮。 |

## valueType 映射

| `valueType` | 编辑控件 | `valueProps` 类型 | 编辑值处理 | 触发写回时机 |
| --- | --- | --- | --- | --- |
| `"string"` | `Input` | `InputProps` | 输入期间维护局部 `editValue`，组件 `value` 传 `undefined`，初始值走 `defaultValue`。 | `onBlur` 后等待 `sleep(20)`，先调用原 `props.onChange`，再写回。 |
| `"textarea"` | `Input.TextArea` | `TextAreaProps` | 同 `"string"`。 | `onBlur` 后写回。 |
| `"number"` | `InputNumber` | `InputNumberProps` | `onChange` 更新局部 `editValue`，控件 `value={value}`。 | `onBlur` 后写回。 |
| `"boolean"` | `Switch` | `SwitchProps` | 渲染为 `<Switch {...props} value={value} />`。 | `props.onChange` 被包装，触发后写回第一个参数。 |
| `"date"` | `DatePicker` | `DatePickerProps` | 进入编辑态时字符串经 `formatToDayjs` 转 dayjs；变更后保存为格式化字符串。 | `onChange` 后写回第一个参数，再由 `formatDayJSValue` 格式化。 |
| `"dateRange"` | `DatePicker.RangePicker` | `Omit<RangePickerProps, "format"> & { format?: string }` | 进入编辑态时数组项转 dayjs；变更后保存为字符串数组。 | `onChange` 后写回第一个参数，再由 `formatDayJSValue` 格式化。 |
| `"select"` | `Select` | `SelectProps` | 展示态用 `options.find(v.value === value)?.label` 显示 label；找不到时显示原值。 | `onChange` 后写回第一个参数。 |
| `"action"` | 不渲染表单控件 | 无 | 展示态把默认编辑按钮传给 `render`；编辑态渲染保存/取消按钮。 | 保存按钮先校验整个表单，再调用 `onSaveRecord`。 |
| `undefined` | 无编辑控件 | 无 | 只展示值、列渲染结果或空值。 | 不进入编辑控件。 |

## 内部状态与事件流

| 状态/ref | 类型 | 初始值 | 说明 |
| --- | --- | --- | --- |
| `editRecords` | `Record<string, Partial<T>>` | `{}` | 所有编辑中和新增中的记录。 |
| `rowKey` | `string` | `props.rowKey || "id"` | 通过 `useMemo` 计算，按字符串字段使用。 |
| `form` | `FormInstance` | 外层 Form 实例或内部 `_form` | 如果组件在 Ant Design `Form` 内部，复用外层实例；否则创建隐藏 Form。 |
| `isStartEditRef` | `boolean` ref | `false` | 标记本次 `editRecords` 变化来自开始编辑，用于回填表单字段。 |

展示数据 `dataList` 的组成：

1. 先取 `editRecords` 中不在 `dataSource` 里的 key，作为新增临时行。
2. 每条新增行补上 `[rowKey]: id`。
3. 再拼接原始 `dataSource`。

开始编辑流程：

1. action 列默认编辑按钮调用 `startEditItem(record[rowKey])`。
2. 从 `dataList` 查找记录。
3. 使用 `JSON.parse(JSON.stringify(record))` 深拷贝后写入 `editRecords`。
4. 标记 `isStartEditRef.current = true`。
5. `useEffect` 遍历现有表单字段名，按 `${id}-${dataIndex}` 回填值；日期字段转 dayjs。

编辑字段流程：

1. 编辑态列渲染为 `Form.Item`，`name` 是 `${record[rowKey]}-${column.dataIndex}`。
2. 内置控件变化后调用统一 `onChange`。
3. 先调用 `column.valueProps?.onChange`，再把值写到 `editRecords[record[rowKey]]`。
4. `dataIndex` 支持点路径，写回使用 `setValue`。

保存流程：

1. 点击保存按钮，`AsyncButton` 设置按钮 loading。
2. 执行 `form.validateFields()`，校验范围是当前 Form 实例的所有字段。
3. 校验通过后调用 `saveEditItem(record[rowKey])`。
4. 复制当前 `editRecords[key]`，调用 `onSaveRecord(editRecord as T)`。
5. `onSaveRecord` 完成后调用 `cancelEditItem(key)` 退出编辑态。

取消流程：点击取消或保存成功后删除对应 `editRecords[key]`。如果是新增临时行，该行会从 `dataList` 消失。

## 依赖

- Ant Design：`Table`、`Form`、`Button`、`Input`、`InputNumber`、`Switch`、`DatePicker`、`Select`。
- 本地组件：`AsyncButton` 用于保存按钮 loading。
- 本地工具：`getValue`、`setValue` 支持点路径；`guid` 生成新增行 key；`sleep(20)` 延迟输入控件 blur 写回。
- `dayjs`：日期进入编辑态和保存前的格式转换。

## 注意事项与边界条件

- 当前实现假设 `rowKey` 是字符串字段名；不适合直接传 Ant Design 支持的函数型 `rowKey`。
- `record[rowKey]` 会被作为对象 key 使用，建议保证非空且唯一。
- 新增行通过 `guid()` 生成临时 key，但如果 `createEditRecord()` 自己返回了与 `dataSource` 冲突的 `rowKey`，合并逻辑可能把它视为已有行。
- 开始编辑使用 JSON 深拷贝，会丢失函数、`Date`、`Map` 等非 JSON 值。
- `customEdit` 类型声明带 `value/onChange`，但当前渲染没有实际传参；使用时需要结合 Form 或自行处理。
- `Form.Item` 的 `name` 通过字符串拼接生成，`dataIndex` 中包含 `-` 时，回填时 `split("-")` 可能解析错误。
- 字符串、数字、文本域只在 blur 后写回，输入过程中不会更新 `editRecords`。
- `renderEditContent` 会直接修改传入的 `props` 对象，例如删除输入类控件的 `props.onChange` 或重写其他控件的 `props.onChange`。
- `Switch` 使用的是 `value` prop，不是 Ant Design 常用的 `checked`；如需严格受控，需要主线程确认现状是否符合预期。
- `formatDayJSValue` 的默认日期格式是 `"YYYY-MM-DD"`，可通过 `valueProps.format` 覆盖。
- 任何一行处于编辑态时，表格 `pagination` 被强制设为 `false`。
- 保存校验调用的是当前 Form 的全部字段；多个编辑行同时存在时，保存一行可能受到其他编辑行校验影响。
