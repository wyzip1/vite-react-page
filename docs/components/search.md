# Search

`Search` 位于 `src/components/Search`，使用 Ant Design `Form` 管理查询条件。所有查询项和操作按钮都在同一个可换行的 flex 流中：宽屏时尽量同行展示，空间不足时按输入项的最小宽度自动换行，操作按钮占用最后一个筛选项之后的下一块区域。

## 文件结构

```text
Search/
├── index.ts          # 公共导出入口
├── Search.tsx        # Form 状态、查询/重置与 action
├── SearchField.tsx   # Form.Item 与字段宽度适配
├── controls.tsx      # 内置控件和自定义控件渲染
├── styles.ts         # 响应式表单布局
├── types.ts          # 公共类型
└── utils.ts          # 初始值与长度转换
```

## 基础用法

```tsx
import Search, { type SearchConfig, type SearchInstance } from "@/components/Search";

const searchRef = useRef<SearchInstance>(null);

const config: SearchConfig = [
  { label: "姓名", key: "name", props: { allowClear: true } },
  {
    label: "时间",
    key: "date",
    type: "dateRange",
    minWidth: 320,
    defaultValue: undefined,
    props: { showTime: true, format: "YYYY-MM-DD HH:mm:ss" },
  },
];

<Search
  ref={searchRef}
  config={config}
  loading={loading}
  labelWidth={100}
  minItemWidth={220}
  maxItemsPerRow={4}
  onChange={setSearchFormData}
  onSearch={state => api.doSearch({ body: state })}
  onReset={state => api.doSearch({ body: state }, { resetPageSize: true })}
/>;
```

## 布局

- `config` 使用一维 `SearchOption[]`，具体换行完全由响应式布局决定。
- 表单使用 `layout="inline"`，查询项可以换行；action 使用一个标准单项宽度，自动排在最后一个筛选项之后的下一块区域。
- `minItemWidth` 通过 `wrapperCol` 设置所有控件区的默认最小宽度，默认为 `220px`；单项可通过 `minWidth` 覆盖。
- `maxItemsPerRow` 设置单行筛选项上限，默认为 `4`。即使实际筛选项不足上限，也仍按上限列数计算单项宽度，不会铺满整行。
- `labelWidth` 通过 `labelCol` 设置所有 label 的默认宽度，默认为 `60px`；单项可通过 `labelWidth` 覆盖。
- 数字宽度按 px 处理，字符串值（如 `"18rem"`、`"30%"`）会原样写入 CSS。
- `autoWrap={false}` 可关闭自动换行，默认开启。

## Props

| 字段              | 类型                     | 默认值  | 说明                               |
| ----------------- | ------------------------ | ------- | ---------------------------------- |
| `config`          | `SearchConfig`           | 必填    | 一维查询项配置。                   |
| `onSearch`        | `(state: State) => void` | 必填    | 提交表单或输入框回车时触发。       |
| `labelWidth`      | `number \| string`       | `60`    | 默认 label 宽度。                  |
| `minItemWidth`    | `number \| string`       | `220`   | 控件区默认最小宽度。               |
| `maxItemsPerRow`  | `number`                 | `4`     | 单行筛选项上限，用于计算单项宽度。 |
| `loading`         | `boolean`                | `false` | 查询和重置的交互锁。               |
| `onChange`        | `(state: State) => void` | -       | 初始化及字段值变化后触发。         |
| `onReset`         | `(state: State) => void` | -       | 点击重置后触发。                   |
| `searchBtnExtend` | `React.ReactNode`        | -       | 放在查询、重置按钮之后的扩展操作。 |
| `actionStyle`     | `React.CSSProperties`    | -       | action 容器样式。                  |
| `actionClassName` | `string`                 | -       | action 容器类名。                  |
| `autoWrap`        | `boolean`                | `true`  | 是否自动换行。                     |

## 查询项配置

```ts
interface ComOptions<T = "input", P = {}> {
  label: string;
  key: string;
  width?: number | string;
  minWidth?: number | string;
  labelWidth?: number | string;
  type?: T;
  props?: P;
  defaultValue?: unknown;
  component?: (onChange, value, search) => React.ReactElement;
}
```

`width` 控制控件宽度，`minWidth` 通过 `wrapperCol` 控制单个查询项的控件区最小宽度。内置类型包括 `input`、`select`、`cascader`、`date` 和 `dateRange`；未指定 `type` 时使用 `input`。

## Ref

`SearchInstance` 提供：

- `getFormData()`：读取 Form 当前全部字段值。
- `resetFormData()`：恢复所有字段的 `defaultValue`，不触发 `onReset`。

点击重置会恢复初始值，并依次触发 `onChange` 和 `onReset`。`loading` 为真时查询和重置会被忽略。
