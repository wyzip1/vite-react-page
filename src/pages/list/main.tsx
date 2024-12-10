import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";
import { store } from "@/store";
import router from "./router";
import "@/styles/tailwind.css";
import "@/styles/index.css";
import { AntConfigProvider } from "@/App";
import CRouterProvider from "@/store/RouterProvider";
import KeepAliveProvider from "@/router/components/KeepAlive/context";

const root = createRoot(document.getElementById("root")!);
root.render(
  <Provider store={store}>
    <AntConfigProvider>
      <KeepAliveProvider>
        <CRouterProvider router={router} />
      </KeepAliveProvider>
    </AntConfigProvider>
  </Provider>,
);
