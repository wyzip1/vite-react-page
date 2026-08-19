import { createContext } from "react";
import type { RouterProviderProps } from "react-router-dom";

export interface RouterProviderContextType {
  router: RouterProviderProps["router"];
}

const RouterProviderContext = createContext<RouterProviderContextType>({} as any);

export default RouterProviderContext;
