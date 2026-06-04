import DefaultTheme from "vitepress/theme";
import DocTable from "./components/DocTable.vue";
import ExpandableTable from "./components/ExpandableTable.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("DocTable", DocTable);
    app.component("ExpandableTable", ExpandableTable);
  },
};
