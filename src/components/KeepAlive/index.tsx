import React, { createContext, useContext } from "react";
import { useOutlet, useLocation, matchPath } from "react-router-dom";
import type { FC } from "react";
//在组件外部建立一个Context
export const KeepAliveContext = createContext<KeepAliveLayoutProps>({
  keepalive: [],
  keepElements: {},
});

//给予页面缓存设置条件判断
const isKeepPath = (aliveList: any[], path: string) => {
  let isKeep = false;
  aliveList.map(item => {
    if (item === path) {
      isKeep = true;
    }
    if (item instanceof RegExp && item.test(path)) {
      isKeep = true;
    }
  });
  return isKeep;
};
//判断当前页面是否已缓存，是则控制hidden开关显示，不是则正常渲染
export function useKeepOutlets() {
  const location = useLocation();
  const element = useOutlet();
  const { keepElements, keepalive } = useContext<any>(KeepAliveContext);
  const isKeep = isKeepPath(keepalive, location.pathname);
  if (isKeep) {
    keepElements.current[location.pathname] = element;
  }
  //标签的显示与隐藏
  return (
    <>
      {" "}
      {Object.entries(keepElements.current).map(([pathname, element]: any) => (
        <div
          key={pathname}
          style={{
            height: "100%",
            width: "100%",
            position: "relative",
            overflow: "hidden auto",
          }}
          className="rumtime-keep-alive-layout"
          hidden={!matchPath(location.pathname, pathname)}
        >
          {element}
        </div>
      ))}
      <div
        hidden={isKeep}
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
          overflow: "hidden auto",
        }}
        className="rumtime-keep-alive-layout-no"
      >
        {!isKeep && element}
      </div>
    </>
  );
}
//设置公共组件类型
interface KeepAliveLayoutProps {
  keepalive: any[];
  keepElements?: any;
  dropByCacheKey?: (path: string) => void;
}
//封装公共组件
const KeepAliveLayout: FC<KeepAliveLayoutProps> = props => {
  const { keepalive, ...other } = props;
  const keepElements = React.useRef<any>({});
  function dropByCacheKey(path: string) {
    keepElements.current[path] = null;
  }
  return (
    <KeepAliveContext.Provider
      value={{ keepalive, keepElements, dropByCacheKey }}
      {...other}
    />
  );
};

export default KeepAliveLayout;
