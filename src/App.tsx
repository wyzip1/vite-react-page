import React from "react";
import { HashRouter } from "react-router-dom";
import RenderRouter from "coms/RenderRouter";
import routerList from "router/index";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: { colorPrimary: "#155bd4", borderRadius: 0 },
      }}
    >
      <main style={{ width: "100%", height: "100vh" }}>
        <HashRouter>
          <RenderRouter routerList={routerList} />
        </HashRouter>
      </main>
    </ConfigProvider>
  );
}
