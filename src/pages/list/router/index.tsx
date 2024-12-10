import { CRouteObject } from "@/types";
import { createLazyLoad } from "@/components/LazyLoad";
import { formatRoutes } from "@/router/utils";
import { createHashRouter } from "react-router-dom";
import KeepAliveView from "@/router/components/KeepAlive";

const baseRoutes: CRouteObject[] = [
  {
    path: "/",
    redirect: "/list",
    element: <KeepAliveView />,
    children: [
      {
        path: "/list",
        title: "mock列表",
        keepAlive: true,
        element: createLazyLoad(lazy(() => import("@/pages/list/App"))),
      },
    ],
  },
  {
    path: "*",
    redirect: "/",
  },
];

const routes = formatRoutes(baseRoutes);
const router = createHashRouter(routes as any);

export default router;
