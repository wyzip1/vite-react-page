import User from "@/api/model/User";
import { createSlice } from "@reduxjs/toolkit";

export interface GlobalState {
  userInfo?: User;
  catchRouters?: string[];
  [key: string]: any;
}

interface GlobalReducers {
  SET_USER_INFO: (state: GlobalState, action: { payload: User }) => void;
  SET_CATCH_ROUTERS: (state: GlobalState, action: { payload: string[] }) => void;
  [key: string]: any;
}

const global = createSlice<GlobalState, GlobalReducers, "global">({
  name: "global",
  initialState: {
    userInfo: undefined,
    catchRouters: [],
  },
  reducers: {
    SET_USER_INFO: (state, action) => {
      state.userInfo = action.payload;
    },
    SET_CATCH_ROUTERS: (state, action) => {
      state.catchRouters = action.payload;
    },
  },
});

export default global.reducer;

export const { SET_USER_INFO, SET_CATCH_ROUTERS } = global.actions;
