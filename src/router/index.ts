import type { router } from "@//types";
import { lazy } from "react";
import { formatRouterList } from "./utils";

const Layout = lazy(() => import("@/layout/index"));

const baseRouterList: router[] = [
  {
    path: "/",
    redirect: "/layout",
  },
  {
    path: "/layout",
    name: "Layout",
    component: Layout,
    redirect: "/layout/list",
    children: [
      {
        path: "list",
        name: "List",
        title: "list",
        component: lazy(() => import("@/pages/list/App")),
      },
      {
        path: "sort-uploader",
        name: "SortUploader",
        title: "sort-uploader",
        component: lazy(() => import("@/pages/sort-uploader/App")),
      },
    ],
  },
];

const routerList = formatRouterList(baseRouterList);

export default routerList;
