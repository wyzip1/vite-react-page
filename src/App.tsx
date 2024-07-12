import React, { useEffect } from "react";
import router from "@/router/index";
import { ConfigProvider, theme } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import "dayjs/locale/zh-cn";
import { RouterProvider } from "react-router-dom";
import { store } from "./store";
import { setTheme, useThemeMode, useToken } from "./store/theme";
import MainStyled from "./store/MainStyled";

export default function App() {
  const themeMode = useThemeMode();
  const themeToken = useToken();
  const { token: antToken } = theme.useToken();

  useEffect(() => {
    function changeTheme() {
      const isDark = prefers.matches;
      store.dispatch(setTheme({ mode: isDark ? "dark" : "light", isOsChange: true }));
    }
    // 获取系统主题 是否为暗色，当然也可以匹配亮色：prefers-color-scheme: light
    const prefers = window.matchMedia?.("(prefers-color-scheme: dark)");
    prefers.addEventListener("change", changeTheme);
  }, []);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: themeMode === "dark" ? [theme.darkAlgorithm] : [theme.defaultAlgorithm],
        token: { colorPrimary: "#155bd4", borderRadius: 0 },
      }}
    >
      <MainStyled
        mode={themeMode}
        token={themeToken}
        antToken={antToken}
        style={{ width: "100%", height: "100vh" }}
      >
        <RouterProvider router={router} />
      </MainStyled>
    </ConfigProvider>
  );
}
