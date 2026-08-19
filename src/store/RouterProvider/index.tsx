import RouterProviderContext from "./context";
import type { RouterProviderProps } from "react-router-dom";
import { RouterProvider } from "react-router-dom";

interface RouterStoreProps {
  router: RouterProviderProps["router"];
  children: React.ReactNode;
}
const RouterStore: React.FC<RouterStoreProps> = ({ children, router }) => {
  return <RouterProviderContext value={{ router }}>{children}</RouterProviderContext>;
};

export const useRouter = () => {
  const context = use(RouterProviderContext);
  return context.router;
};

const CRouterProvider: React.FC<RouterProviderProps> = ({ router, ...props }) => {
  return (
    <RouterStore router={router}>
      <RouterProvider router={router} {...props} />
    </RouterStore>
  );
};

export default CRouterProvider;
