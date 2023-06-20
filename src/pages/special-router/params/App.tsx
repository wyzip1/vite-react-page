import { RouterComponentProps } from "@/components/RenderRouter";
import React from "react";
import { useParams } from "react-router-dom";

const Params: React.FC<RouterComponentProps> = ({ children }) => {
  const { params } = useParams();
  console.log("params", params);

  return (
    <>
      <p>Params: {params}</p>
      {children}
    </>
  );
};

export default Params;
