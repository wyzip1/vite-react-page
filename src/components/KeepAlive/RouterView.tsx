import React, { useContext, useMemo } from "react";
import { KeepAliveContext } from "./index";
import { useLocation, useOutlet } from "react-router-dom";
import { matchRoute } from "@/router/utils";

const RouterView: React.FC = () => {
  const context = useContext(KeepAliveContext);
  const Location = useLocation();
  const element = useOutlet();
  const isKeep = useMemo<boolean>(() => {
    if (!context.includes) return true;
    return context.includes.some(pathname => matchRoute(pathname, Location.pathname));
  }, [Location.pathname, context.includes]);

  if (isKeep && element) {
    context.keepElements[Location.pathname] = element;
  }

  console.log("12312312");

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
