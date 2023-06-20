import React, { Suspense, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

import Loading from "./Loading";

import type { LazyExoticComponent, CSSProperties, FC } from "react";
import { getRouterPath } from "@/router/utils";

export interface RouterComponentProps {
  children?: null | number | string | JSX.Element;
  style?: CSSProperties;
  [key: string]: unknown;
}

export interface router {
  hidden?: boolean;
  title?: string;
  name?: string;
  role?: string[];
  redirect?: string;
  path: string;
  component?: LazyExoticComponent<FC<RouterComponentProps>>;
  children?: router[];
  activePath?: string;
  catch?: boolean;
}

interface RenderRouterProps {
  routerList: router[];
  parentList?: router;
}

interface ProfileProps {
  redirect?: string;
  path: string;
  children: JSX.Element;
}

interface RouterElementProps {
  router: router;
}

const Profile = ({ redirect, children, path }: ProfileProps) => {
  const navigate = useNavigate();
  const Location = useLocation();

  useEffect(() => {
    const routerPath = getRouterPath(Location.pathname);
    const lastRouter = routerPath[routerPath.length - 1];
    const canRedirect = redirect && lastRouter.path === path;
    if (!canRedirect) return;
    if (!redirect) return;
    navigate(redirect, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Location.pathname]);

  return <>{children}</>;
};

interface RenderComponentProps {
  router?: router;
}

const RenderComponent: React.FC<RenderComponentProps> = ({ router }) => {
  if (!router?.component) return;
  if (!router.children?.length) return <router.component />;
  return (
    <router.component path={router.path}>
      <RenderRouter routerList={router.children} />
    </router.component>
  );
};

const RouterElement = ({ router }: RouterElementProps) => {
  return (
    <Profile redirect={router.redirect} path={router.path}>
      <Suspense fallback={<Loading />}>
        <RenderComponent router={router} />
      </Suspense>
    </Profile>
  );
};

const createRouter = (router: router, index: number) => {
  const { name, path } = router;
  return <Route key={name || index} path={path} element={<RouterElement router={router} />} />;
};

const mapRouter = (routerList: router[]) => {
  return routerList.map(createRouter);
};

export default function RenderRouter({ routerList }: RenderRouterProps) {
  return <Routes>{mapRouter(routerList)}</Routes>;
}
