import React, { useMemo } from "react";
import { Menu } from "antd";

import type { MenuProps } from "antd";
import type { router } from "src/types";
import { useLocation, useNavigate } from "react-router-dom";

interface MenuListProps {
  routerList: router[];
}

const mapPathLink = (router: router): string => {
  if (!router._parent) return router.path.replace("/*", "");
  return mapPathLink(router._parent) + "/" + router.path;
};

const getItems = (routers?: router[]): MenuProps["items"] => {
  if (!routers) return;
  const mapMenu = (router: router) => ({
    label: router.title,
    key: mapPathLink(router),
    children: getItems(router.children),
  });

  const itemList = routers.filter(item => item.name && !item.hidden);

  return itemList.map(mapMenu) as MenuProps["items"];
};

const mapRouter = (router: router, parent?: router): router => {
  if (router.children?.length)
    router.children.forEach(_router => mapRouter(_router, router));
  router._parent = parent;
  return router;
};

export default function MenuList({ routerList }: MenuListProps) {
  const Location = useLocation();
  const navigate = useNavigate();

  const mapRouteList = useMemo<router[]>(() => {
    return routerList.map(router => mapRouter(router));
  }, [routerList]);

  const items = useMemo<MenuProps["items"]>(() => {
    return getItems(mapRouteList);
  }, [mapRouteList]);

  const expandAll = useMemo(() => {
    return mapRouteList.filter(router => router.children?.length).map(mapPathLink);
  }, [mapRouteList]);

  return (
    <Menu
      items={items}
      mode="inline"
      theme="dark"
      defaultOpenKeys={expandAll}
      selectedKeys={[Location.pathname]}
      onSelect={({ selectedKeys }) => navigate(selectedKeys[0])}
    />
  );
}
