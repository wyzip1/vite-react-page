import type { router } from "src/types";
import { lazy } from "react";

const Layout = lazy(() => import("layout/index"));

const routerList: router[] = [
  {
    path: "/",
    redirect: "/layout",
  },
  {
    path: "/layout/*",
    name: "Layout",
    component: Layout,
    redirect: "/layout/list",
    children: [
      {
        path: "list",
        name: "List",
        title: "list",
        component: lazy(() => import("pages/home/list/App")),
      },
      {
        path: "detail",
        name: "Detail",
        title: "detail",
        component: lazy(() => import("pages/home/detail/App")),
      },
      {
        path: "group/*",
        name: "group",
        title: "group",
        redirect: "/layout/group/test-a",
        component: lazy(() => import("pages/test/group")),
        children: [
          {
            path: "test-a",
            name: "TestA",
            title: "test-a",
            component: lazy(() => import("pages/test/test-a/App")),
          },
          {
            path: "test-b",
            name: "TestB",
            title: "test-b",
            component: lazy(() => import("pages/test/test-b/App")),
          },
        ],
      },
      {
        path: "/online-script",
        name: "RedirectOnlineScript",
        title: "在线代码执行",
      },
    ],
  },
  {
    path: "/online-script",
    name: "OnlineScript",
    component: lazy(() => import("pages/online-script/App")),
  },
];

export default routerList;
