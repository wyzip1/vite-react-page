export function transferDataToQuery(data: object, isStart = true): string {
  let result = isStart ? "?" : "";
  for (const key in data) {
    const value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
    if ([undefined, null].includes(value)) continue;
    result += `${key}=${value}&`;
  }
  return result.substring(0, result.length - 1);
}

export function parseJSON(value: string): Record<string, unknown> | string {
  try {
    return JSON.parse(value);
  } catch (_) {
    /* empty */
  }
  return value;
}

export function transferStringListToData(list: string[]): Record<string, unknown> {
  return list.reduce((prev: Record<string, unknown>, current) => {
    const [key, data] = current.split("=");
    prev[key] = parseJSON(data);
    return prev;
  }, {});
}

export function transferQueryToData(search: string | undefined = location.href.split("?")[1]) {
  if (!search) return {};
  return transferStringListToData(search.split("&"));
}

export function getCookie() {
  return transferStringListToData(document.cookie.split("; "));
}
