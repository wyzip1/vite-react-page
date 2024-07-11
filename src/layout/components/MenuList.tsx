import React, { useMemo } from "react";
import { matchRoutes, useLocation, useNavigate } from "react-router-dom";
import { Menu, MenuProps } from "antd";
import router from "@/router";
import { CRouteObject } from "@/types";

const getItems = (routes?: CRouteObject[]): MenuProps["items"] => {
  if (!routes) return;
  const mapMenu = (route: CRouteObject) => {
    const children = getItems(route.children);
    return { label: route.title, key: route.fullPath, children };
  };

  const itemList = routes.filter(item => !item.hidden);
  if (!itemList.length) return [];

  return itemList.map(item => mapMenu(item)) as any;
};

const MenuList: React.FC = () => {
  const Location = useLocation();
  const navigate = useNavigate();

  const items = useMemo<MenuProps["items"]>(() => {
    return getItems(router.routes[1].children);
  }, []);

  const expandAll = useMemo(() => {
    return items?.filter(item => item?.key).map(item => item!.key!.toString());
  }, [items]);

  const activePaths = useMemo(() => {
    const routes = matchRoutes(router.routes, Location.pathname);
    return routes?.map(v => (v.route as CRouteObject).activePath).filter(v => !!v) as string[];
  }, [Location.pathname]);

  const selectKeys = useMemo(() => {
    const routes = matchRoutes(router.routes, Location.pathname);
    return routes?.map(v => v.pathname);
  }, [Location.pathname]);
  console.log(items, selectKeys);

  return (
    <Menu
      items={items}
      itemProp=""
      mode="inline"
      theme="dark"
      defaultOpenKeys={expandAll}
      selectedKeys={activePaths?.length ? activePaths : selectKeys}
      onSelect={({ selectedKeys }) => {
        navigate(selectedKeys[0]);
      }}
    />
  );
};

export default MenuList;
