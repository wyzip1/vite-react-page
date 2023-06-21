import { router } from "@/types";
import routerList from "./index";

export function matchRoute(routerPath: string, path: string, exact: boolean = true): boolean {
  const routeSegments = routerPath.replace(/\/\*/g, "").split("/");
  const pathSegments = path.split("/");

  if (exact && routeSegments.length !== pathSegments.length) return false;

  for (let i = 0; i < pathSegments.length; i++) {
    if (!exact && i + 1 > routeSegments.length) return true;
    const routeSegment = routeSegments[i];
    const pathSegment = pathSegments[i];

    if (routeSegment === pathSegment) continue;
    if (routeSegment.startsWith(":")) continue;
    if (routeSegment === "*") continue;

    return false;
  }
  return true;
}

export function formatRouterList(list: router[], parent?: router) {
  const result: router[] = [];
  for (const item of list) {
    const data = { ...item };
    data.path = data.path.replace(/\/\*/g, "");
    if (parent && !data.path.startsWith("/")) data.path = parent.path + `/${data.path}`;
    if (data.children?.length) {
      data.children = formatRouterList(data.children, data);
    }
    result.push(data);
  }
  return result;
}

export function getRouter(path: string, list = routerList): router | undefined {
  for (const item of list) {
    if (matchRoute(item.path, path)) return item;
    const result = getRouter(path, item.children || []);
    if (result) return result;
  }
}
