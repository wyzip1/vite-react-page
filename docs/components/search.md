# Search

`Search` 位于 `src/components/Search`，职责是把二维配置渲染成查询表单，并统一处理查询、重置、字段变更和按钮扩展区。实现文件包括：

| 文件 | 职责 |
| --- | --- |
| `src/components/Search/index.tsx` | 主组件、状态、事件、ref 方法。 |
| `src/components/Search/type.ts` | `SearchProps`、`Options`、`Config`、实例类型。 |
| `src/components/Search/utils.ts` | 长度格式化、配置初始化。 |
| `src/components/Search/components/RenderRow.tsx` | 渲染一行查询项。 |
| `src/components/Search/components/RenderItem.tsx` | 渲染单个 label 和 value，并写回状态。 |
| `src/components/Search/components/mapComponent.tsx` | 根据 `type` 映射 Ant Design 控件。 |
| `src/components/Search/components/items/Input.tsx` | 输入框封装，支持回车查询。 |
| `src/components/Search/components/items/DatePicker.tsx` | 日期和日期范围封装，负责字符串与 dayjs 转换。 |
| `src/components/Search/styled.ts` | 布局、默认标签宽度、换行控制。 |

## 基础用法

```tsx
import Search from "@/components/Search";
import type { Config, SearchInstance } from "@/components/Search/type";

const searchRef = useRef<SearchInstance>(null);

const config: Config = [
  [
    { label: "姓名", key: "name", props: { allowClear: true } },
    {
      label: "时间",
      key: "date",
      type: "dateRange",
      defaultValue: undefined,
      props: { showTime: true, format: "YYYY-MM-DD HH:mm:ss" },
    },
  ],
];

<Search
  ref={searchRef}
  config={config}
  loading={loading}
  defaultLabelWidth={100}
  onChange={setSearchFormData}
  onSearch={state => api.doSearch(state)}
  onReset={state => api.doSearch(state)}
/>;
```

## Props

`SearchProps` 不继承 Ant Design 表单 props，只有下列字段。

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `config` | `Options[][]` | 是 | 无 | 查询项配置。外层数组表示行，内层数组表示同一行内的项。 |
| `onSearch` | `(state: State) => void` | 是 | 无 | 点击查询按钮，或 `input` 回车且未处于 `loading` 时触发。 |
| `inline` | `boolean` | 否 | `undefined` | 为真时根节点使用 `flex` 布局，`searchBtnExtend` 渲染到单独的 `.inline-ext-btns`。 |
| `defaultLabelWidth` | `number \| string` | 否 | `60` | 默认 label 宽度。数字会经 `covertLength` 转为 `${n}px`，字符串原样使用。 |
| `loading` | `boolean` | 否 | `undefined` | 查询和重置的交互锁。为真时查询、重置函数直接返回。 |
| `onChange` | `(state: State) => void` | 否 | `undefined` | `formData` 每次变化后由 `useEffect` 触发，包含初始化后的首次触发。 |
| `onReset` | `(state: State) => void` | 否 | `undefined` | 点击重置且未处于 `loading` 时，在重置 state 后同步触发，参数是重置后的对象。 |
| `searchBtnExtend` | `React.ReactNode` | 否 | `undefined` | 扩展按钮。非 `inline` 时放在查询/重置按钮后；`inline` 时放到独立容器。 |
| `actionStyle` | `React.CSSProperties` | 否 | `undefined` | 透传到 `.action-control` 的行内样式。 |
| `actionClassName` | `string` | 否 | `undefined` | 拼接到 `.action-control` 的 className。 |
| `autoWrap` | `boolean` | 否 | `true` | 控制每行 `.search-row` 是否 `flex-wrap: wrap`。 |

`State` 类型为 `{ [key: string]: any }`，字段来自每个查询项的 `key`。

## Config 与 Options

```ts
export interface ComOptions<T = "input", P = {}> {
  label: string;
  key: string;
  width?: number | string;
  labelWidth?: number | string;
  type?: T;
  props?: P;
  defaultValue?: unknown;
  component?: (onChange: ChangeState, value: any, search: () => void) => JSX.Element;
}
```

| 字段 | 类型 | 必填 | 默认值 | 透传关系与说明 |
| --- | --- | --- | --- | --- |
| `label` | `string` | 是 | 无 | 渲染在 `.label` 中。 |
| `key` | `string` | 是 | 无 | 写入 `formData[key]`；初始化和重置时取 `defaultValue`。 |
| `width` | `number \| string` | 否 | `"100%"` | 内置控件宽度。数字转 px，字符串原样使用。 |
| `labelWidth` | `number \| string` | 否 | `defaultLabelWidth` | 当前项 label 宽度，通过 React style 设置；数字按 React 规则作为 px。 |
| `type` | `"input" \| "select" \| "date" \| "dateRange" \| "cascader"` | 否 | `"input"` | 未传且未传 `component` 时，`initComponentList` 会把配置对象原地补为 `"input"`。 |
| `props` | 按 `type` 匹配的 Ant Design props | 否 | `undefined` | 透传给内置控件，部分事件会被组件接管，详见下方映射表。 |
| `defaultValue` | `unknown` | 否 | `undefined` | 初始值、重置值，也是当前 state 为 `undefined` 时传给控件的兜底值。 |
| `component` | `(onChange, value, search) => JSX.Element` | 否 | 由 `type` 生成 | 自定义渲染函数。存在时跳过内置 `type` 映射。 |

## Type 映射

| `type` | 控件 | `props` 类型 | 值类型 | 事件行为 |
| --- | --- | --- | --- | --- |
| 空或 `"input"` | `Input` | `InputProps` | `string` | `onChange` 写入 `event.target.value`；`onKeyDown` 最终由组件接管，`Enter` 时调用 `search()`，再调用 `props.onKeyDown`。 |
| `"select"` | `Select` | `SelectProps` | 取决于 Ant Design `Select` | `onChange(value)` 直接写入 state。`props` 在 JSX 中后展开，可覆盖内置 `value/onChange/style`。 |
| `"cascader"` | `Cascader` | `CascaderAutoProps` | 取决于 Ant Design `Cascader` | `onChange(value)` 直接写入 state。`props` 在 JSX 中后展开，可覆盖内置 `value/onChange/style`。 |
| `"date"` | `DatePicker` | `DatePickerProps` | `string` | 渲染前用 `dayjs(value)` 转为组件值；`onChange(_, date)` 写入格式化后的 `date` 字符串。 |
| `"dateRange"` | `DatePicker.RangePicker` | `RangePickerProps` | `[string \| null, string \| null] \| null` | 渲染前分别转为 dayjs；`onChange(_, date)` 写入字符串数组。 |
| 自定义 `component` | 调用方返回的 JSX | 无固定类型 | 调用方决定 | 需要主动调用入参 `onChange(value)` 写回状态，可调用 `search()` 触发查询。 |

## Ref 方法

`Search` 通过 `forwardRef` 暴露 `SearchInstance`。

| 方法 | 类型 | 说明 |
| --- | --- | --- |
| `getFormData()` | `() => State` | 返回当前闭包中的 `formData`。 |
| `resetFormData()` | `() => void` | 直接把 state 设置为 `config.defaultValue` 生成的初始对象；不会调用 `onReset`，但会因 `formData` 变化触发 `onChange`。 |

## 内部状态与事件流

| 状态 | 类型 | 初始值 | 变化时机 |
| --- | --- | --- | --- |
| `formData` | `State` | 遍历 `config` 后得到 `{ [key]: defaultValue }` | 查询项 `onChange`、按钮重置、ref `resetFormData`。 |
| `isReset` | `boolean` | `false` | 点击重置时置 `true`；`loading` 变为假值后置 `false`。用于区分哪个按钮显示 loading。 |

字段变更流程：

1. `RenderItem` 创建局部 `onChange(value)`。
2. 该函数直接修改当前 `state[options.key]`，随后 `setState({ ...state })` 触发新对象更新。
3. `formData` 变化后，`useEffect` 调用 `onChange(formData)`。

查询流程：

1. 点击查询按钮或 `input` 按下 `Enter`。
2. 如果 `loading` 为真，直接返回。
3. 调用必传的 `onSearch(formData)`。

重置流程：

1. 点击重置按钮。
2. 如果 `loading` 为真，直接返回。
3. 重新遍历 `config` 生成初始对象。
4. `isReset` 置为 `true`，`formData` 更新为初始对象。
5. 同步调用 `onReset(initData)`；随后 `useEffect` 还会触发 `onChange(initData)`。

## 依赖

- Ant Design：`Button`、`Input`、`Select`、`Cascader`、`DatePicker`。
- `dayjs`：日期字符串与 Ant Design 日期值之间的转换。
- `styled-components`：`SearchStyled` 布局。
- 本地工具：`covertLength`、`initComponentList`。

## 注意事项与边界条件

- `config` 只在首次 `useState(initFormData())` 时初始化 `formData`；后续 `config` 变化会更新 `componentList`，但不会自动重建当前 state。
- `initComponentList` 会原地修改未传 `component` 的配置项，补充 `type` 和 `component`。
- `key` 不做唯一性校验，重复时后面的初始化值会覆盖前面的同名字段，变更时也写入同一个字段。
- `onChange` 包含组件挂载后的首次触发，调用方如果只想监听用户操作，需要自行区分。
- `onReset` 与 `onChange` 都可能在一次重置中触发；不要在两个回调里重复发同一个请求，除非业务明确需要。
- `loading` 为真时查询和重置都会被忽略，但输入控件仍可编辑。
- `date`/`dateRange` 组件对外写出字符串或字符串数组，不写出 dayjs 对象。
- `input` 的 `props.onChange` 会被组件内部 `onChange` 覆盖；`props.onKeyDown` 会在组件处理 `Enter` 后被调用。
- `select` 和 `cascader` 的 `props` 后展开，调用方传入同名 `onChange/value/style` 会覆盖组件内置绑定，可能导致状态不更新。
- 自定义 `component` 的 `value` 参数在 `state[key] === undefined` 时会回退为 `defaultValue`。
