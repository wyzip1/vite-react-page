import React from "react";
import { CRouteObject } from "@/types";
import WrapRedirect from "./components/WrapRedirect";
import PermissionRouter from "./components/PermissionRouter";
import { formatTree } from "@/utils";
import KeepAlive from "react-activation";

const createElement = (route: CRouteObject) => {
  let element = route.element;
  if (route.keepAlive) {
    element = <KeepAlive>{element}</KeepAlive>;
  }
  if (route.redirect) {
    element = <WrapRedirect>{element}</WrapRedirect>;
  }
  if (route.roles?.length) {
    element = <PermissionRouter>{element}</PermissionRouter>;
  }

  return element;
};

export const formatRoutes = (routes: CRouteObject[]) => {
  return formatTree(routes, (route, _, parent) => {
    const data: CRouteObject = {
      ...route,
      fullPath: route.path?.startsWith("/")
        ? route.path
        : `${parent?.fullPath || parent?.path || ""}/${route.path}`.replace("//", "/"),
    };
    data.element = createElement(route);

    return data;
  });
};
