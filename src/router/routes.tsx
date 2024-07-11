import React, { lazy } from "react";
import { CRouteObject } from "@/types";
import { formatRoutes } from "./autoRoutes";
import { redirect } from "react-router-dom";
import LayoutPage from "@/layout";
import { createLazyLoad } from "@/components/LazyLoad";

const baseRoutes: CRouteObject[] = [
  {
    path: "/",
    loader: () => redirect("/layout"),
  },
  {
    path: "/layout",
    redirect: "/layout/list",
    element: <LayoutPage />,
    children: [
      {
        path: "list",
        title: "mock列表",
        element: createLazyLoad(lazy(() => import("@/pages/list/App"))),
        redirect: "/layout/list/detail",
        children: [
          {
            path: "detail",
            title: "详情",
            element: createLazyLoad(lazy(() => import("@/pages/list/detail"))),
          },
        ],
      },

      {
        path: "sort-uploader",
        title: "拖拽排序上传",
        element: createLazyLoad(lazy(() => import("@/pages/sort-uploader/App"))),
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
