import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";
import { store } from "@/store";
import router from "./router";
import "@/styles/index.css";
import { AntConfigProvider } from "@/App";
import CRouterProvider from "@/store/RouterProvider";
import { scan } from "react-scan";
import KeepAliveProvider from "@/router/components/KeepAlive/context";

function autoSetCookie() {
  const cookiesImport = import.meta.glob("../cookies.json")["../cookies.json"];
  if (!cookiesImport) return;
  cookiesImport().then(res => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    (res as typeof import("../cookies.json")).cookies.forEach(cookie => {
      document.cookie = `${cookie.name}=${cookie.value};`;
    });
  });
}

if (process.env.NODE_ENV === "development") {
  autoSetCookie();
}

if (typeof window !== "undefined" && import.meta.env.MODE === "scan") {
  scan({
    enabled: true,
    log: true, // logs render info to console (default: false)
  });
}

const root = createRoot(document.getElementById("app")!);
root.render(
  <Provider store={store}>
    <AntConfigProvider>
      <KeepAliveProvider>
        <CRouterProvider router={router} />
      </KeepAliveProvider>
    </AntConfigProvider>
  </Provider>,
);
