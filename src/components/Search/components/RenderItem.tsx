import React from "react";
import type { RenderItemProps } from "../type";

export default function RenderItem({
  options,
  state,
  setState,
  search,
}: RenderItemProps) {
  const onChange = (value: unknown) => {
    state[options.key] = value;
    setState({ ...state });
  };

  return (
    <div className="search-item">
      <div className="label">{options.label}</div>
      <div className="value">
        {options.component!(onChange, state[options.key], search)}
      </div>
    </div>
  );
}
