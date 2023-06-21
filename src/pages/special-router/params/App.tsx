import { RouterComponentProps } from "@/components/RenderRouter";
import React from "react";
import { Outlet, useParams } from "react-router-dom";

const Params: React.FC<RouterComponentProps> = () => {
  const { params } = useParams();
  console.log("params", params);

  return (
    <>
      <p>Params: {params}</p>
      <Outlet />
    </>
  );
};

export default Params;
