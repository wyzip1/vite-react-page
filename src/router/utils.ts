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
