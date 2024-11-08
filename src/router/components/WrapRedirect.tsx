import { useRouter } from "@/store/RouterProvider";
import { CRouteObject } from "@/types";
import React, { useEffect } from "react";
import { matchRoutes, useLocation, useNavigate } from "react-router-dom";

interface WrapRedirectProps {
  children?: React.ReactNode;
  redirect?: string;
}
const WrapRedirect: React.FC<WrapRedirectProps> = ({ children }) => {
  const navigate = useNavigate();
  const Location = useLocation();
  const router = useRouter();
  useEffect(() => {
    const routes = matchRoutes(router.routes, Location.pathname);
    if (!routes?.length) return;
    const value = (routes[routes.length - 1].route as CRouteObject).redirect;

    value && navigate(value, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Location.pathname]);

  return <>{children}</>;
};

export default WrapRedirect;
