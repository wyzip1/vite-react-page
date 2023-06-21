import type { router } from "@//types";
import { lazy } from "react";

const Layout = lazy(() => import("@/layout/index"));

const routerList: router[] = [
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
        component: lazy(() => import("@/pages/home/list/App")),
      },
      {
        path: "detail",
        name: "Detail",
        title: "detail",
        component: lazy(() => import("@/pages/home/detail/App")),
      },
      {
        path: "group",
        name: "group",
        title: "group",
        redirect: "/layout/group/test-a",
        component: lazy(() => import("@/pages/test/group")),
        children: [
          {
            path: "test-a",
            name: "TestA",
            title: "test-a",
            component: lazy(() => import("@/pages/test/test-a/App")),
          },
          {
            path: "test-b",
            name: "TestB",
            title: "test-b",
            component: lazy(() => import("@/pages/test/test-b/App")),
          },
        ],
      },
      {
        path: "online-script",
        name: "RedirectOnlineScript",
        title: "在线代码执行",
        redirect: "/online-script",
      },
      {
        path: "special-router",
        name: "SpecialRouter",
        title: "特殊路由",
        component: lazy(() => import("@/pages/special-router/App")),
        children: [
          {
            path: ":params",
            hidden: true,
            name: "SpecialRouterParams",
            title: "特殊路由参数",
            component: lazy(() => import("@/pages/special-router/params/App")),
            redirect: "plain",
            children: [
              {
                path: "plain",
                name: "Plain",
                title: "plain",
                component: lazy(() => import("@/pages/special-router/params/plain/App")),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/online-script",
    name: "OnlineScript",
    component: lazy(() => import("@/pages/online-script/App")),
  },
];

const formatRouterList = (list: router[] = routerList, parent?: router) => {
  const result: router[] = [];
  for (const item of list) {
    const data = { ...item };

    if (parent && !data.path.startsWith("/")) {
      data.path = parent.path.replace(/\/\*/g, "") + `/${data.path}`;
    }

    if (data.children?.length) {
      data.children = formatRouterList(data.children, data);
    }
    result.push(data);
  }
  return result;
};

export default formatRouterList();
