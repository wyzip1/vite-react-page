import { Menu, MenuProps } from "antd";
import { CRouteObject } from "@/types";
import { useThemeMode } from "@/store/theme";
import { useMatchRoutes, useMenuRoutes } from "@/router/components/PermissionRouter";

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
  const navigate = useNavigate();
  const theme = useThemeMode();

  const menuRoutes = useMenuRoutes();
  const matchRoutes = useMatchRoutes();

  const items = useMemo<MenuProps["items"]>(() => {
    return getItems(menuRoutes);
  }, [menuRoutes]);

  const expandAll = useMemo(() => {
    return items?.filter(item => item?.key).map(item => item!.key!.toString());
  }, [items]);

  const activePaths = useMemo(() => {
    return matchRoutes?.map(v => v.route.activePath).filter(v => !!v) as string[];
  }, [matchRoutes]);

  const selectKeys = useMemo(() => {
    return matchRoutes?.map(v => v.pathname);
  }, [matchRoutes]);

  return (
    <Menu
      items={items}
      theme="dark"
      mode="inline"
      style={{ backgroundColor: theme === "dark" ? "transparent" : "" }}
      defaultOpenKeys={expandAll}
      selectedKeys={activePaths?.length ? activePaths : selectKeys}
      onSelect={({ selectedKeys }) => {
        navigate(selectedKeys[0]);
      }}
    />
  );
};

export default MenuList;
