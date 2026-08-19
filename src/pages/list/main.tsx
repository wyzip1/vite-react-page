import { createRoot } from "react-dom/client";
import router from "./router";
import "@/styles/index.css";
import { AntConfigProvider } from "@/App";
import CRouterProvider from "@/store/RouterProvider";
import KeepAliveProvider from "@/router/components/KeepAlive/context";

const root = createRoot(document.getElementById("app")!);
root.render(
  <AntConfigProvider>
    <KeepAliveProvider>
      <CRouterProvider router={router} />
    </KeepAliveProvider>
  </AntConfigProvider>,
);
