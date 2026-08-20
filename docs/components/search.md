# Search

`Search` 位于 `src/components/Search`，使用 Ant Design `Form` 管理查询条件。所有查询项和操作按钮都在同一个 flex 流中按顺序连续排列，空间不足时自动换行。

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
    inputWidth: 320,
    defaultValue: undefined,
    props: { showTime: true, format: "YYYY-MM-DD HH:mm:ss" },
  },
];

<Search
  ref={searchRef}
  config={config}
  loading={loading}
  labelWidth={100}
  inputWidth={220}
  onChange={setSearchFormData}
  onSearch={state => api.doSearch({ body: state })}
  onReset={state => api.doSearch({ body: state }, { resetPageSize: true })}
/>;
```

## 布局

- `config` 使用一维 `SearchOption[]`，具体换行完全由响应式布局决定。
- 表单使用 `layout="inline"`，查询项和 action 按配置顺序自然排列，空间不足时自动换行。
- 每个筛选项的总宽度为 `labelWidth + inputWidth`。
- `inputWidth` 通过 `wrapperCol` 设置所有控件区的固定宽度，默认为 `220px`；单项可通过 `inputWidth` 覆盖。
- `labelWidth` 通过 `labelCol` 设置所有 label 的默认宽度，默认为 `60px`；单项可通过 `labelWidth` 覆盖。
- 数字宽度按 px 处理，字符串值（如 `"18rem"`、`"30%"`）会原样写入 CSS。

## Props

| 字段              | 类型                     | 默认值  | 说明                               |
| ----------------- | ------------------------ | ------- | ---------------------------------- |
| `config`          | `SearchConfig`           | 必填    | 一维查询项配置。                   |
| `onSearch`        | `(state: State) => void` | 必填    | 提交表单或输入框回车时触发。       |
| `labelWidth`      | `number \| string`       | `60`    | 默认 label 宽度。                  |
| `inputWidth`      | `number \| string`       | `220`   | 控件区默认固定宽度。               |
| `loading`         | `boolean`                | `false` | 查询和重置的交互锁。               |
| `onChange`        | `(state: State) => void` | -       | 初始化及字段值变化后触发。         |
| `onReset`         | `(state: State) => void` | -       | 点击重置后触发。                   |
| `searchBtnExtend` | `React.ReactNode`        | -       | 放在查询、重置按钮之后的扩展操作。 |
| `actionStyle`     | `React.CSSProperties`    | -       | action 容器样式。                  |
| `actionClassName` | `string`                 | -       | action 容器类名。                  |

## 查询项配置

```ts
interface ComOptions<T = "input", P = {}> {
  label: string;
  key: string;
  inputWidth?: number | string;
  labelWidth?: number | string;
  type?: T;
  props?: P;
  defaultValue?: unknown;
  component?: (onChange, value, search) => React.ReactElement;
}
```

`inputWidth` 通过 `wrapperCol` 控制单个查询项的控件区固定宽度，查询项总宽度始终为 `labelWidth + inputWidth`。内置类型包括 `input`、`select`、`cascader`、`date` 和 `dateRange`；未指定 `type` 时使用 `input`。

## Ref

`SearchInstance` 提供：

- `getFormData()`：读取 Form 当前全部字段值。
- `resetFormData()`：恢复所有字段的 `defaultValue`，不触发 `onReset`。

点击重置会恢复初始值，并依次触发 `onChange` 和 `onReset`。`loading` 为真时查询和重置会被忽略。
