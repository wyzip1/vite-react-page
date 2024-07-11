import React, { useMemo } from "react";
import { matchRoutes, useLocation } from "react-router-dom";
import router from "../index";
import { CRouteObject } from "@/types";

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

export default PermissionRouter;
