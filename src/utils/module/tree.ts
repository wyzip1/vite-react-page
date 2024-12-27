export function assembleTree<T = any>(
  list: T[],
  key: keyof T,
  parentKey: keyof T,
  children: keyof T,
) {
  const result: T[] = [];
  const catched: Array<T[keyof T]> = [];
  for (const item of list) {
    item[children] = list.filter(data => {
      data[parentKey] === item[key] && catched.push(data[key]);
      return data[parentKey] === item[key];
    }) as T[keyof T];
    result.push(item);
  }
  return result.filter(item => !catched.includes(item[key]));
}

export function eachTree<T = any>(
  tree: T[],
  callback: (item: T) => boolean | undefined | void,
  key = "children",
) {
  const list = [tree];
  for (let i = 0; i < list.length; i++) {
    for (const node of list[i]) {
      if (node[key]?.length) list.push(node[key]);
      const value = callback(node);
      if (value) return node;
    }
  }
}

export function formatTree<T>(
  tree: T[],
  callback: (item: T, children: T[], parent?: any) => any,
  key = "children",
  parent?: any,
): any[] {
  const result: any[] = [];
  for (const node of tree) {
    const data = { ...node };
    const value = callback(data, data[key] as T[], parent);
    result.push(value);
    if (value[key]) {
      value[key] = formatTree(value[key] as T[], callback, key, value) as any;
    }
  }
  return result;
}

export function findTreePath<T = any>(
  tree: T[],
  callback: (item: T) => boolean | undefined,
  key = "children",
  path: T[] = [],
): T[] | undefined {
  for (const node of tree) {
    const currentPath = [...path];
    currentPath.push(node);
    const isFind = callback(node);

    if (isFind) return currentPath;

    if ((node as any)[key]?.length) {
      const findPath = findTreePath((node as any)[key], callback, key, currentPath);
      if (findPath) return findPath;
    }
  }
}
