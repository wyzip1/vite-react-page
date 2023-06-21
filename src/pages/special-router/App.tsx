import { RouterComponentProps } from "@/components/RenderRouter";
import React from "react";
import { Outlet } from "react-router-dom";

const SpecialRouter: React.FC<RouterComponentProps> = () => {
  return (
    <>
      <p>SpecialRouter</p>
      <Outlet />
    </>
  );
};

export default SpecialRouter;
