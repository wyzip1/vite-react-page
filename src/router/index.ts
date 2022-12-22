import type { router } from "src/types";
import { lazy } from "react";

const Layout = lazy(() => import("layout/index"));

const routerList: router[] = [
  {
    path: "/",
    redirect: "/main",
  },
  {
    title: "home",
    name: "Home",
    path: "/main/*",
    component: Layout,
    redirect: "/main/list",
    children: [
      {
        path: "list",
        name: "tlist",
        title: "home-list",
        component: lazy(() => import("pages/home/list/App")),
      },
      {
        path: "detail",
        name: "tdetail",
        title: "home-detail",
        activePath: "/main/list",
        component: lazy(() => import("pages/home/detail/App")),
      },
    ],
  },
  {
    title: "test",
    name: "Test",
    path: "/test/*",
    redirect: "/test/a",
    component: Layout,
    children: [
      {
        path: "a",
        name: "ta",
        title: "test-a",
        hidden: true,
        activePath: "/test/b",
        component: lazy(() => import("pages/test/test-a/App")),
      },
      {
        path: "b",
        name: "tb",
        title: "test-b",
        component: lazy(() => import("pages/test/test-b/App")),
      },
    ],
  },
];

export default routerList;
