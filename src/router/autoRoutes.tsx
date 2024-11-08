import { CRouteObject } from "@/types";
import React from "react";
import LayoutPage from "@/layout/index";
import AppMain from "@/App";
import Template from "@/components/Template";
import { formatRoutes } from "./utils";

const createRoute = (pageData: Record<string, any>, path: string): CRouteObject => ({
  path,
  title: pageData.title || path,
  hidden: pageData.hidden,
  roles: pageData.roles,
  activePath: pageData.activePath,
  element: <Template />,
});

function getAutoBaseRoutes() {
  const list = import.meta.glob("@/pages/**/App.tsx", { eager: true });

  const baseRoutes: CRouteObject[] = [
    {
      path: "/",
      element: <AppMain />,
      children: [
        {
          path: "/",
          element: <LayoutPage />,
          children: [],
          isMenuRoot: true,
        },
      ],
    },
    {
      path: "*",
      redirect: "/",
    },
  ];
  const createToPath = (filePath: string) => {
    const pathList = filePath.match(/\/src\/pages\/(.+)\/App.tsx/)?.[1].split("/") || [];
    let value = baseRoutes[0].children![0];
    const pageData = list[filePath] as Record<string, any>;
    for (const path of pathList) {
      if (!value.children) value.children = [];
      let nextValue = value.children!.find(v => v.path === path);

      if (!nextValue) nextValue = createRoute(pageData, path);

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
