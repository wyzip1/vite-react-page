import Path from "./path";

export function getValue<T>(data: T, path?: Path<T>): any {
  if (!path) return;
  for (const key of path.split(".")) data = data?.[key];
  return data;
}

export function setValue<T>(data: T, value: any, path?: Path<T>) {
  if (!path) return data;

  const props = path.split(".");
  let current = data;

  for (let i = 0; i < props.length - 1; i++) {
    const prop = props[i];
    if (!current[prop]) current[prop] = {};

    current = current[prop];
  }

  current[props[props.length - 1]] = value;
  return data;
}

// 过滤对象空值属性
export const filterObjEmpty = (obj: any) => {
  if (!obj) return obj;
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => !["", null, undefined].includes(value as any)),
  );
};
