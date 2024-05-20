import React from "react";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { store } from "@/store";
import App from "./App";
import "@/styles/tailwind.css";
import "@/styles/index.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <Provider store={store}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>,
);
