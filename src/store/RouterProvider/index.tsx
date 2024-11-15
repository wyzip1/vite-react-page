import type { Router } from "@remix-run/router";
import RouterProviderContext from "./context";
import { RouterProvider, RouterProviderProps } from "react-router-dom";

interface RouterStoreProps {
  router: Router;
  children: React.ReactNode;
}
const RouterStore: React.FC<RouterStoreProps> = ({ children, router }) => {
  return (
    <RouterProviderContext.Provider value={{ router }}>
      {children}
    </RouterProviderContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterProviderContext);
  return context.router;
};

const CRouterProvider: React.FC<RouterProviderProps> = ({ router, ...props }) => {
  return (
    <RouterStore router={router}>
      <RouterProvider future={{ v7_startTransition: true }} router={router} {...props} />
    </RouterStore>
  );
};

export default CRouterProvider;
