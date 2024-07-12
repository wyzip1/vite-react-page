import { CRouteObject } from "@/types";
import React from "react";
import LayoutPage from "@/layout/index";
import Template from "@/components/Template";
import WrapRedirect from "./components/WrapRedirect";
import PermissionRouter from "./components/PermissionRouter";
import { formatTree } from "@/utils";

const createElement = (route: CRouteObject) => {
  let element = route.element;
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
      fullPath: `${parent?.fullPath || parent?.path || ""}/${route.path}`.replace("//", "/"),
    };
    data.element = createElement(route);

    return data;
  });
};

function getAutoBaseRoutes() {
  const list = import.meta.glob("@/pages/**/App.tsx", { eager: true });

  const baseRoutes: CRouteObject[] = [
    {
      path: "/",
      element: <LayoutPage />,
      children: [],
      isMenuRoot: true,
    },
  ];
  const createToPath = (filePath: string) => {
    const pathList = filePath.match(/\/src\/pages\/(.+)\/App.tsx/)?.[1].split("/") || [];
    let value = baseRoutes[0];

    for (const path of pathList) {
      if (!value.children) value.children = [];
      let nextValue = value.children!.find(v => v.path === path);

      if (!nextValue) {
        nextValue = {
          path,
          title: (list[filePath] as any).title || path,
          hidden: (list[filePath] as any).hidden,
          roles: (list[filePath] as any).roles,
          activePath: (list[filePath] as any).activePath,
          element: <Template />,
        };
      }

      if (!value.redirect) {
        value.redirect = path;
      }
      value.children!.push(nextValue);
      value = nextValue;
    }
    const Element = (list[filePath] as any).default;
    value.element = <Element />;
    return value;
  };
  for (const filePath of Object.keys(list)) {
    createToPath(filePath);
  }

  return baseRoutes;
}

export default formatRoutes(getAutoBaseRoutes());
