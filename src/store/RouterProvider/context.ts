import { createContext } from "react";
import type { Router } from "@remix-run/router";

export interface RouterProviderContextType {
  router: Router;
}

const RouterProviderContext = createContext<RouterProviderContextType>({} as any);

export default RouterProviderContext;
