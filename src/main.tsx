import { createRoot } from "react-dom/client";
import router from "./router";
import "@/styles/index.css";
import { AntConfigProvider } from "@/App";
import CRouterProvider from "@/store/RouterProvider";
import { scan } from "react-scan";
import KeepAliveProvider from "@/router/components/KeepAlive/context";

if (typeof window !== "undefined" && import.meta.env.MODE === "scan") {
  scan({
    enabled: true,
    log: true, // logs render info to console (default: false)
  });
}

const root = createRoot(document.getElementById("app")!);
root.render(
  <AntConfigProvider>
    <KeepAliveProvider>
      <CRouterProvider router={router} />
    </KeepAliveProvider>
  </AntConfigProvider>,
);
