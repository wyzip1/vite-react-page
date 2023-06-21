import { RouterComponentProps } from "@/components/RenderRouter";
import React from "react";
import { Outlet } from "react-router-dom";
export default function Group(props: RouterComponentProps) {
  return (
    <>
      <p>TEST - GROUP</p>
      <Outlet />
    </>
  );
}
