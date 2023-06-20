import { RouterComponentProps } from "@/components/RenderRouter";
import React from "react";

const SpecialRouter: React.FC<RouterComponentProps> = ({ children }) => {
  return (
    <>
      <p>SpecialRouter</p>
      {children}
    </>
  );
};

export default SpecialRouter;
