import React from "react";
import { HashRouter } from "react-router-dom";
import RenderRouter from "@/components/RenderRouter";
import routerList from "@/router/index";
import { ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import "dayjs/locale/zh-cn";
// import KeepAlive from "./components/Keep-Alive";
// import { useSelector } from "react-redux";
// import { RootState } from "./store";

export default function App() {
  // const catchRouters = useSelector<RootState, string[] | undefined>(
  //   state => state.global.catchRouters
  // );

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: { colorPrimary: "#155bd4", borderRadius: 0 },
      }}
    >
      <main style={{ width: "100%", height: "100vh" }} className="bg-slate-500">
        <HashRouter>
          {/* <KeepAlive include={catchRouters}> */}
          <RenderRouter routerList={routerList} />
          {/* </KeepAlive> */}
        </HashRouter>
      </main>
    </ConfigProvider>
  );
}
