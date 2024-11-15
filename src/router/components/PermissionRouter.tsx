import { matchRoutes } from "react-router-dom";
import { CRouteObject } from "@/types";
import { eachTree } from "@/utils";
import { useRouter } from "@/store/RouterProvider";

interface PermissionRouterProps {
  children: React.ReactNode;
  authValidator?: () => boolean;
}

const PermissionRouter: React.FC<PermissionRouterProps> = ({ children }) => {
  const Location = useLocation();
  const router = useRouter();

  const roles = useMemo(() => {
    const routes = matchRoutes(router.routes, Location.pathname);

    return routes?.length ? (routes[routes.length - 1].route as CRouteObject).roles : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Location.pathname]);

  const authValidator = () => {
    console.log("roles", roles);

    return true;
  };

  return authValidator() ? children : null;
};

export const useMenuRoutes = () => {
  const router = useRouter();
  const routes = useMemo(
    () => eachTree(router.routes, (route: CRouteObject) => route.isMenuRoot)?.children || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return routes;
};

export const useMatchRoutes = () => {
  const Location = useLocation();
  const router = useRouter();
  const routes = useMemo(
    () => matchRoutes(router.routes, Location.pathname) || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Location.pathname],
  );
  return routes as (Omit<(typeof routes)[number], "route"> & { route: CRouteObject })[];
};

export default PermissionRouter;
