import { Input, InputNumber, InputNumberProps, InputProps } from "antd";
import React from "react";

type TypeMap = "text" | "number";
type TypeToValue<T> = T extends "text" ? string : T extends "number" ? number | null : never;

export type EditInputValue<T extends TypeMap> = undefined | TypeToValue<T>;

interface EditInputProps<T extends TypeMap> {
  value?: EditInputValue<T>;
  updateValue: EditInputValue<T>;
  edit?: boolean;
  type: T;
  onChange?(value: EditInputValue<T>): void;
  props?: InputProps | InputNumberProps;
}

function EditInput<T extends TypeMap>({
  value,
  updateValue,
  edit,
  onChange,
  type = "text" as T extends TypeMap ? T : never,
  props,
}: EditInputProps<T>) {
  if (!edit) return <>{value}</>;

  if (type === "text") {
    return (
      <Input
        value={updateValue as string | undefined}
        onChange={e => onChange?.(e.target.value as TypeToValue<T>)}
        {...(props as InputProps)}
      />
    );
  } else if (type === "number") {
    return (
      <InputNumber
        value={updateValue as number | null | undefined}
        onChange={value => onChange?.(value as TypeToValue<T>)}
        {...(props as InputNumberProps)}
      />
    );
  }
  return <></>;
}

export default EditInput;
