import React, { useMemo } from "react";
import { Breadcrumb, BreadcrumbProps } from "antd";
import { Link, useLocation, matchRoutes } from "react-router-dom";
import router from "@/router";
import { CRouteObject } from "@/types";

interface BreadcrumbMenuListProps {}

const getBread = (pathname: string) => {
  const routes = matchRoutes(router.routes, pathname);

  return routes
    ?.filter(route => (route.route as CRouteObject).title !== undefined)
    .map((route, idx) => ({
      key: route.pathname,
      title:
        idx === routes.length - 1 ? (
          <span>{(route.route as CRouteObject).title}</span>
        ) : (
          <Link to={route.pathname}>{(route.route as CRouteObject).title}</Link>
        ),
    }));
};

const BreadcrumbMenuList: React.FC<BreadcrumbMenuListProps> = () => {
  const Location = useLocation();
  const items = useMemo(
    () => getBread(Location.pathname) as BreadcrumbProps["items"],
    [Location.pathname],
  );

  return <Breadcrumb items={items} />;
};
export default BreadcrumbMenuList;
