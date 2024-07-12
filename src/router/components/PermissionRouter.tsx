import React, { useMemo } from "react";
import { matchRoutes, useLocation } from "react-router-dom";
import router from "../index";
import { CRouteObject } from "@/types";
import { eachTree } from "@/utils";

interface PermissionRouterProps {
  children: React.ReactNode;
  authValidator?: () => boolean;
}

const PermissionRouter: React.FC<PermissionRouterProps> = ({ children }) => {
  const Location = useLocation();
  const roles = useMemo(() => {
    const routes = matchRoutes(router.routes, Location.pathname);

    return routes?.length ? (routes[routes.length - 1].route as CRouteObject).roles : [];
  }, [Location.pathname]);

  const authValidator = () => {
    console.log("roles", roles);

    return true;
  };

  return authValidator() ? children : null;
};

export const useMenuRoutes = () => {
  const routes = useMemo(
    () => eachTree(router.routes, (route: CRouteObject) => route.isMenuRoot)?.children || [],
    [],
  );

  return routes;
};

export const useMatchRoutes = () => {
  const Location = useLocation();
  const routes = useMemo(
    () => matchRoutes(router.routes, Location.pathname) || [],
    [Location.pathname],
  );
  return routes as (Omit<(typeof routes)[number], "route"> & { route: CRouteObject })[];
};

export default PermissionRouter;
