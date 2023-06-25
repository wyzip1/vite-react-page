import React, { memo, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRouter, matchRoute } from "@/router/utils";

import { Menu } from "antd";

import type { MenuProps } from "antd";
import type { router } from "@/types";
import { ItemType, SubMenuType } from "antd/es/menu/hooks/useItems";

interface MenuListProps {
  routerList: router[];
}

const basePath = "/layout/*";

const getItems = (routers?: router[], parentList: router[] = []): MenuProps["items"] => {
  if (!routers) return;
  const mapMenu = (router: router) => {
    const parentPath = parentList.map(item => item.path).join("/");
    const formatParentPath = parentPath ? "/" + parentPath : "";
    const fullPath = router.path.startsWith("/")
      ? router.path
      : `${basePath}${formatParentPath}/${router.path}`;
    const key = fullPath.replace(/\/\*/g, "");
    const children = getItems(router.children, [...parentList, router]);

    return { label: router.title, key, children };
  };

  const itemList = routers.filter(item => item.name && !item.hidden);

  if (!itemList.length) return;

  return itemList.map(item => mapMenu(item));
};

function MenuList({ routerList }: MenuListProps) {
  const Location = useLocation();
  const navigate = useNavigate();

  const items = useMemo<MenuProps["items"]>(() => {
    return getItems(routerList);
  }, [routerList]);

  const expandAll = useMemo(() => {
    return items?.filter(item => item?.key).map(item => item!.key!.toString());
  }, [items]);

  const activePath = useMemo(() => {
    const router = getRouter(Location.pathname);
    return router?.activePath;
  }, [Location.pathname]);

  const eachItems = (callback: (data: ItemType) => void, list: MenuProps["items"] = items) => {
    for (const item of list || []) {
      callback(item);
      Array.isArray((item as SubMenuType).children) &&
        eachItems(callback, (item as SubMenuType).children);
    }
  };

  const selectKeys = useMemo(() => {
    const result: string[] = [];
    eachItems(data => {
      if (!matchRoute(data!.key as string, Location.pathname, Location.pathname === "/layout"))
        return;
      result.push(data!.key as string);
    });
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Location.pathname]);

  return (
    <Menu
      items={items}
      mode="inline"
      theme="dark"
      defaultOpenKeys={expandAll}
      selectedKeys={activePath ? [activePath] : selectKeys}
      onSelect={({ selectedKeys }) => navigate(selectedKeys[0])}
    />
  );
}

export default memo(MenuList);
