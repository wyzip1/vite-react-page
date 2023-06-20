import routerList from "./index";

import type { router } from "@/types";

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

export function getRouterPath(path: string, list: router[] = routerList): router[] {
  const pathList = path.split("/");
  const current = pathList[1];
  const result: router[] = [];

  const router = list.find(item => {
    const itemPath = item.path.replace(/(\/\*)|(\/)/g, "");
    if (itemPath.startsWith(":")) return true;
    if (itemPath === "*") return true;
    if (itemPath === current) return true;
  });

  if (!router) return result;
  result.push(router);

  if (pathList.length === 2) return result;
  if (!Array.isArray(router.children) || !router.children.length) return result;

  const matchList = getRouterPath("/" + pathList.slice(2).join("/"), router.children);

  result.push(...matchList);
  return result;
}
