import React, { lazy } from "react";
import { CRouteObject } from "@/types";
import { formatRoutes } from "./autoRoutes";
import LayoutPage from "@/layout";
import { createLazyLoad } from "@/components/LazyLoad";
import AppMain from "@/App";

const baseRoutes: CRouteObject[] = [
  {
    path: "/",
    element: <AppMain />,
    children: [
      {
        path: "/",
        redirect: "/list",
        isMenuRoot: true,
        element: <LayoutPage />,
        children: [
          {
            path: "/list",
            title: "mock列表",
            element: createLazyLoad(lazy(() => import("@/pages/list/App"))),
          },

          {
            path: "sort-uploader",
            title: "拖拽排序上传",
            element: createLazyLoad(lazy(() => import("@/pages/sort-uploader/App"))),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    redirect: "/",
  },
];

const routes = formatRoutes(baseRoutes);
export default routes;
