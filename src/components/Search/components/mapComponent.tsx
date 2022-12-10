/* eslint-disable react/display-name */
import React from "react";
import { Input, Select } from "antd";
import { covertLength } from "../utils";

import type { ChangeState, Options } from "../type";

const mapComponent = (options: Options) => {
  const width = covertLength(options.width) || "100%";
  switch (options.type) {
    case "input":
      return (onChange: ChangeState, value: unknown, search: () => void) => {
        return (
          <Input
            value={value as string}
            onChange={ev => onChange(ev.target.value)}
            style={{ width }}
            {...options.props}
            onKeyDown={ev => {
              if (ev.code !== "Enter") return;
              search();
              options.props?.onKeyDown?.(ev);
            }}
          />
        );
      };
    case "select":
      return (onChange: ChangeState, value: unknown) => (
        <Select value={value} onChange={onChange} style={{ width }} {...options.props} />
      );
    default:
      return () => <></>;
  }
};

export default mapComponent;
