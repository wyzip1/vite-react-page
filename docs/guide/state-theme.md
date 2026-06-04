# 状态与主题

## Store 入口

全局 Redux store 位于 `src/store/index.ts`：

```ts
export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
});
```

当前只有一个 slice：`theme`。主应用在 `src/main.tsx` 中用 React Redux `Provider` 注入 store：

```tsx
<Provider store={store}>
  <AntConfigProvider>
    <KeepAliveProvider>
      <CRouterProvider router={router} />
    </KeepAliveProvider>
  </AntConfigProvider>
</Provider>
```

`Provider` 必须包裹 `AntConfigProvider` 和布局，因为主题算法、布局样式和主题切换按钮都会读取 `theme` 状态。

## ThemeState

`src/store/theme.ts` 定义主题状态：

```ts
export interface ThemeToken {}

interface ThemeState {
  mode: "light" | "dark";
  light: ThemeToken;
  syncOs: boolean;
  dark: ThemeToken;
}
```

实际 initialState：

| 字段 | 类型 | 默认值/来源 | 使用位置 | 影响 |
| --- | --- | --- | --- | --- |
| `mode` | `"light" \| "dark"` | `storage.get("theme") || "light"` | `useThemeMode`、`AntConfigProvider`、`LayoutPage`、`MainStyled`。 | 决定 Ant Design 使用暗色或亮色算法，也决定业务样式 token。 |
| `syncOs` | `boolean` | `false` | `setTheme` reducer。 | 当系统主题变化触发 `setTheme({ isOsChange: true })` 时，如果 `syncOs` 为 false，会忽略本次变化。当前没有 reducer 修改它。 |
| `light` | `ThemeToken` | `{ headerBg: "#ffffff99" }` | `useToken()`、`LayoutPageStyled`。 | 亮色模式业务 token。虽然 `ThemeToken` 接口为空，运行时对象包含 `headerBg`。 |
| `dark` | `ThemeToken` | `{ headerBg: "rgba(31, 31, 31, 0.6)" }` | `useToken()`、`LayoutPageStyled`。 | 暗色模式业务 token。 |

## Reducer

`setTheme(state, action)` 的行为：

```ts
if (action.payload.isOsChange && !state.syncOs) return;
state.mode = action.payload.mode;
storage.set("theme", state.mode);
```

| payload 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `mode` | `"light" \| "dark"` | 是 | 目标主题模式。当前 reducer 未声明 payload 类型，调用侧需自行保证。 |
| `isOsChange` | `boolean` | 否 | 标记是否来自系统主题变化。为 true 且 `syncOs` 为 false 时不生效。 |

主题模式会写入本地存储 key `theme`，下次初始化时优先读取。

## Selector Hooks

`theme.ts` 导出两个读取 hook：

| Hook | 类型 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `useThemeMode()` | `() => "light" \| "dark"` | 当前主题模式 | 内部通过 `useSelector` 读取 `state.theme.mode`。 |
| `useToken(forceTheme?)` | `(forceTheme?: "light" \| "dark") => ThemeToken` | 当前或指定主题 token | 不传时返回 `state.theme[state.theme.mode]`；传入时强制返回指定模式 token。 |

常见使用：

```ts
import { setTheme, useThemeMode, useToken } from "@/store/theme";
import { store } from "@/store";

const mode = useThemeMode();
const token = useToken();
store.dispatch(setTheme({ mode: "dark" }));
```

## Ant Design Provider

`AntConfigProvider` 位于 `src/App.tsx`：

- `locale` 使用 `antd/es/locale/zh_CN`。
- `theme.algorithm` 根据 `themeMode` 选择 `theme.darkAlgorithm` 或 `theme.defaultAlgorithm`。
- `theme.token` 固定设置 `{ colorPrimary: "#155bd4", borderRadius: 0 }`。
- `dayjs` 引入 `zh-cn` locale。

因此业务组件可直接使用 Ant Design 组件，默认语言为中文，亮暗主题由 Redux 控制。

## 系统主题监听

`App` 中注册：

```ts
const prefers = window.matchMedia?.("(prefers-color-scheme: dark)");
prefers.addEventListener("change", changeTheme);
```

`changeTheme` 会 dispatch：

```ts
setTheme({ mode: isDark ? "dark" : "light", isOsChange: true })
```

由于 `syncOs` 默认是 false，当前系统主题变化不会覆盖用户主题。后续如果要启用系统同步，需要补充修改 `syncOs` 的 reducer 和 UI 入口。

## 布局中的主题使用

`src/layout/index.tsx` 读取：

```ts
const themeMode = useThemeMode();
const { token: antToken } = theme.useToken();
const themeToken = useToken();
```

使用位置：

| 位置 | 使用内容 | 影响 |
| --- | --- | --- |
| `Radio.Group` | `value={themeMode}` | 显示当前明亮/暗黑选项。 |
| `Radio.Group.onChange` | `store.dispatch(setTheme({ mode: e.target.value }))` | 用户主动切换主题，并写入本地存储。 |
| `LayoutPageStyled` | `antToken`、`themeToken`、`mode` | 计算页面背景、Header 背景、侧边栏背景、边框和滚动条颜色。 |
| `MenuList` | `useThemeMode()` | 暗色模式下菜单背景透明。 |

## RouterProvider Store

`src/store/RouterProvider` 不是 Redux slice，而是 React context：

| 文件 | 内容 | 说明 |
| --- | --- | --- |
| `context.ts` | `RouterProviderContext` | 保存 `{ router }`。 |
| `index.tsx` | `RouterStore`、`useRouter`、`CRouterProvider` | 包装 React Router `RouterProvider`，让菜单、面包屑、权限和 KeepAlive 能读取同一个 router。 |

`CRouterProvider` 会传入：

```tsx
<RouterProvider future={{ v7_startTransition: true }} router={router} />
```

因此工程已开启 React Router 的 `v7_startTransition` future flag。

## 状态放置建议

| 状态类型 | 推荐位置 | 当前示例 |
| --- | --- | --- |
| 主题、用户、权限、全局配置 | `store` | `theme.mode`、`theme.light`、`theme.dark`。 |
| 当前页面筛选、分页、编辑中数据 | 页面组件或页面 hook | `src/pages/list/App.tsx` 的 `searchFormData`，`useFetchList` 的 `pageNum/pageSize/list`。 |
| 弹窗打开状态和提交 loading | `CustomModal`、`useModal` | list 页的 `openModal`。 |
| 请求 loading 和响应数据 | `useRequest`、`useFetchList` | list 页的 `state.loading`、`state.list`。 |
| 可跨组件广播但不需要持久化的事件 | `useSub` 或事件工具 | 适合轻量订阅，不进入 Redux。 |
