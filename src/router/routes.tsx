import { CRouteObject } from "@/types";
import LayoutPage from "@/layout";
import { createLazyLoad } from "@/components/LazyLoad";
import AppMain from "@/App";
import { formatRoutes } from "./utils";

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
