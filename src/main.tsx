import React from "react";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";
import { store } from "@/store";
import router from "@/router/index";
import "@/styles/tailwind.css";
import "@/styles/index.css";
import { RouterProvider } from "react-router-dom";
import { AntConfigProvider } from "./App";

const root = createRoot(document.getElementById("root")!);
root.render(
  <Provider store={store}>
    <AntConfigProvider>
      <RouterProvider router={router} />
    </AntConfigProvider>
  </Provider>,
);
