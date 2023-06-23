import React, { useContext, useMemo } from "react";
import { KeepAliveContext } from "./index";
import { useLocation, useOutlet } from "react-router-dom";
import { getRouter, matchRoute } from "@/router/utils";

const RouterView: React.FC = () => {
  const context = useContext(KeepAliveContext);
  const Location = useLocation();
  const element = useOutlet();
  const isKeep = useMemo<boolean>(() => {
    if (!context.includes) return true;
    return context.includes.some(item => matchRoute(item.path, Location.pathname));
  }, [Location.pathname, context.includes]);

  if (isKeep && element) {
    const routerPath = getRouter(Location.pathname)?.path;
    removeParamsPathElement(routerPath);
    context.keepElements[Location.pathname] = element;
  }

  function removeParamsPathElement(routerPath?: string) {
    if (!routerPath?.includes(":")) return;
    for (const pathname of Object.keys(context.keepElements)) {
      if (!matchRoute(routerPath, pathname)) continue;
      delete context.keepElements[pathname];
    }
  }

  //标签的显示与隐藏
  return (
    <>
      {!isKeep && element}
      {Object.entries(context.keepElements).map(([pathname, element]: any) => (
        <div
          key={pathname}
          style={{
            height: "100%",
            width: "100%",
            position: "relative",
            overflow: "hidden auto",
          }}
          className="rumtime-keep-alive-layout"
          hidden={!matchRoute(pathname, Location.pathname)}
        >
          {element}
        </div>
      ))}
    </>
  );
};

export default RouterView;
