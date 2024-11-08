import React from "react";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";
import { store } from "@/store";
import router from "./router";
import "@/styles/tailwind.css";
import "@/styles/index.css";
import { AntConfigProvider } from "@/App";
import CRouterProvider from "@/store/RouterProvider";

const root = createRoot(document.getElementById("root")!);
root.render(
  <Provider store={store}>
    <AntConfigProvider>
      <CRouterProvider router={router} />
    </AntConfigProvider>
  </Provider>,
);
