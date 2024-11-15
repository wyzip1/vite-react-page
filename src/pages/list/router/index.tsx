import { CRouteObject } from "@/types";
import { createLazyLoad } from "@/components/LazyLoad";
import { formatRoutes } from "@/router/utils";
import { createHashRouter } from "react-router-dom";

const baseRoutes: CRouteObject[] = [
  {
    path: "/",
    redirect: "/list",
  },
  {
    path: "/list",
    title: "mock列表",
    element: createLazyLoad(lazy(() => import("@/pages/list/App"))),
  },
];

const routes = formatRoutes(baseRoutes);
const router = createHashRouter(routes as any);

export default router;
