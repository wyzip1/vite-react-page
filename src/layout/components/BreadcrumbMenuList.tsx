import React from "react";
import { Breadcrumb, BreadcrumbProps } from "antd";
import { Link, useLocation, Location } from "react-router-dom";
import { router } from "@/types";

interface BreadcrumbMenuListProps {
  routerList: router[];
}

const getBread = (router: router, location: Location, parentPath = "") => {
  const path = (parentPath + router.path).replace("/*", "");
  const result: BreadcrumbProps["items"] = [];
  if (!location.pathname.includes(path)) return result;
  const children =
    (router.children
      ?.map(item => getBread(item, location, path + "/"))
      .flat(Infinity) as BreadcrumbProps["items"]) || [];

  if (["/", "/layout"].includes(path)) {
    result.push(...children);
    return result;
  }

  result.push(
    {
      key: router.path,
      title:
        path !== location.pathname ? (
          <Link to={path}>{router.title}</Link>
        ) : (
          <span>{router.title}</span>
        ),
    },
    ...children
  );
  return result;
};

const BreadcrumbMenuList: React.FC<BreadcrumbMenuListProps> = ({ routerList }) => {
  const uLocation = useLocation();
  const items = routerList
    .map(router => getBread(router, uLocation))
    .flat(Infinity) as BreadcrumbProps["items"];

  return <Breadcrumb items={items} />;
};
export default BreadcrumbMenuList;
