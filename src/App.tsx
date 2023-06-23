import React, { useEffect } from "react";
import RenderRouter from "@/components/RenderRouter";
import routerList from "@/router/index";
import { ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import "dayjs/locale/zh-cn";
import KeepAliveProvider from "./components/KeepAlive";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";
import { ADD_CATCH_ROUTERS, CatchRouter } from "@/store/global";
import { getRouter, matchRoute } from "./router/utils";

export default function App() {
  const Location = useLocation();

  const catchRouters = useSelector<RootState, CatchRouter[]>(
    state => state.global.catchRouters
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const router = getRouter(Location.pathname);
    if (!router || !router.title) return;
    const hasCatch = catchRouters.some(catchRouter =>
      matchRoute(router.path, catchRouter.path)
    );
    if (hasCatch) return;
    dispatch(
      ADD_CATCH_ROUTERS({
        title: router.title,
        path: router.path,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Location.pathname]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: { colorPrimary: "#155bd4", borderRadius: 0 },
      }}
    >
      <main style={{ width: "100%", height: "100vh" }} className="bg-slate-500">
        <KeepAliveProvider includes={catchRouters}>
          <RenderRouter routerList={routerList} />
        </KeepAliveProvider>
      </main>
    </ConfigProvider>
  );
}
