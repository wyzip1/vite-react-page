import User from "@/api/model/User";
import { createSlice } from "@reduxjs/toolkit";

export interface GlobalState {
  userInfo?: User;
}

interface GlobalReducers {
  SET_USER_INFO: (state: GlobalState, action: { payload: User }) => void;
  [key: string]: any;
}

const global = createSlice<GlobalState, GlobalReducers, "global">({
  name: "global",
  initialState: {
    userInfo: undefined,
  },
  reducers: {
    SET_USER_INFO: (state, action) => {
      state.userInfo = action.payload;
    },
  },
});

export default global.reducer;

export const { SET_USER_INFO } = global.actions;
