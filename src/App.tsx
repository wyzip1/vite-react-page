import React from "react";
import router from "@/router/index";
import { ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import "dayjs/locale/zh-cn";
import { RouterProvider } from "react-router-dom";

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: { colorPrimary: "#155bd4", borderRadius: 0 },
      }}
    >
      <main style={{ width: "100%", height: "100vh" }}>
        <RouterProvider router={router} />
      </main>
    </ConfigProvider>
  );
}
