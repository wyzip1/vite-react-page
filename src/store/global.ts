import User from "@/api/model/User";
import { createSlice } from "@reduxjs/toolkit";

export interface CatchRouter {
  title: string;
  path: string;
}

export interface GlobalState {
  userInfo?: User;
  catchRouters: Array<CatchRouter>;
  [key: string]: any;
}

interface GlobalReducers {
  SET_USER_INFO: (state: GlobalState, action: { payload: User }) => void;
  SET_CATCH_ROUTERS: (state: GlobalState, action: { payload: CatchRouter[] }) => void;
  ADD_CATCH_ROUTERS: (state: GlobalState, action: { payload: CatchRouter }) => void;
  REMOVE_CATCH_ROUTERS: (state: GlobalState, action: { payload: string }) => void;
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
    ADD_CATCH_ROUTERS: (state, action) => {
      state.catchRouters.push(action.payload);
    },
    REMOVE_CATCH_ROUTERS(state, action) {
      const index = state.catchRouters.findIndex(item => item.path === action.payload);
      if (index === -1) return;
      state.catchRouters.splice(index, 1);
    },
  },
});

export default global.reducer;

export const { SET_USER_INFO, SET_CATCH_ROUTERS, ADD_CATCH_ROUTERS, REMOVE_CATCH_ROUTERS } =
  global.actions;
