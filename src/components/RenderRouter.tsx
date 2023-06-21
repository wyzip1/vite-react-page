import React, { Suspense, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

import Loading from "./Loading";

import type { LazyExoticComponent, CSSProperties, FC } from "react";
import { matchRoute } from "@/router/utils";

export interface RouterComponentProps {
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
    const canRedirect = redirect && matchRoute(path, Location.pathname);
    if (!canRedirect) return;
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
  return <router.component path={router.path} />;
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

const createRouter = (router: router) => {
  return (
    <Route key={router.path} path={router.path} element={<RouterElement router={router} />}>
      {mapRouter(router.children || [])}
    </Route>
  );
};

const mapRouter = (routerList: router[]) => {
  return routerList.map(createRouter);
};

export default function RenderRouter({ routerList }: RenderRouterProps) {
  return <Routes>{mapRouter(routerList)}</Routes>;
}
