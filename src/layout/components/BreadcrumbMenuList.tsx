import React from "react";
import { Breadcrumb, BreadcrumbProps } from "antd";
import { Link, useLocation, Location } from "react-router-dom";
import { getRouterPath, matchRoute } from "@/router/utils";

interface BreadcrumbMenuListProps {}

const getBread = (location: Location) => {
  const routerPath = getRouterPath(location.pathname);

  return routerPath
    ?.filter(router => router.title !== undefined)
    .map(router => ({
      key: router.path,
      title: matchRoute(router.path, location.pathname) ? (
        <span>{router.title}</span>
      ) : (
        <Link to={router.path}>{router.title}</Link>
      ),
    }));
};

const BreadcrumbMenuList: React.FC<BreadcrumbMenuListProps> = () => {
  const uLocation = useLocation();
  const items = getBread(uLocation) as BreadcrumbProps["items"];

  return <Breadcrumb items={items} />;
};
export default BreadcrumbMenuList;
