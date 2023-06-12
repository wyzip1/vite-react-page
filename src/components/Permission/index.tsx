import User from "@/api/model/User";
import { RootState } from "@/store";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";

interface PermissionProps {
  auth?:
    | {
        admin?: boolean;
        usernames?: string[];
      }
    | ((user: User) => boolean);
  children?: React.ReactNode;
}

const Permission: React.FC<PermissionProps> = ({ auth, children }) => {
  const user = useSelector<RootState, User>(state => state.global.userInfo!);
  const hasAuth = useMemo<boolean>(() => {
    if (typeof auth === "function") return auth(user);
    if (auth?.usernames?.length) {
      return auth.usernames.includes(user.username);
    } else if (!auth?.admin) return true;
    else return user.admin;
  }, [auth, user]);
  return hasAuth ? <>{children}</> : <></>;
};

export default Permission;
