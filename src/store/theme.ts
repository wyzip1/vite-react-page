import storage from "@/utils/module/storage";
import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

export interface ThemeToken {}

interface ThemeState {
  mode: "light" | "dark";
  light: ThemeToken;
  syncOs: boolean;
  dark: ThemeToken;
}

const theme = createSlice({
  name: "theme",
  initialState: {
    mode: (storage.get("theme") || "light") as "light" | "dark",
    syncOs: false,
    light: {
      headerBg: "#ffffff99",
    },
    dark: {
      headerBg: "rgba(31, 31, 31, 0.6)",
    },
  } satisfies ThemeState,
  reducers: {
    setTheme(state, action) {
      if (action.payload.isOsChange && !state.syncOs) return;
      state.mode = action.payload.mode;
      storage.set("theme", state.mode);
    },
  },
});

export function useToken(forceTheme?: "light" | "dark") {
  return useSelector(
    (state: { theme: ReturnType<typeof theme.getInitialState> }) =>
      state.theme[forceTheme || state.theme.mode],
  );
}

export function useThemeMode() {
  return useSelector(
    (state: { theme: ReturnType<typeof theme.getInitialState> }) => state.theme.mode,
  );
}

export const { setTheme } = theme.actions;

export default theme.reducer;
