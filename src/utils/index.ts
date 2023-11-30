import { message } from "antd";
import Path from "./path";

export { default as events } from "./subscribe";

export function guid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function transferDataToQuery(data: object, isStart = true): string {
  let result = isStart ? "?" : "";
  for (const key in data) {
    const value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
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

export function formatNum(num: number, fixed = 2): string {
  const value = num.toString();
  if (fixed <= value.length) return value;
  const preload = Array.from({ length: fixed - value.length }, () => "0").join("");
  return preload + value;
}

interface DateFormatSetting {
  value: "Y" | "M" | "D" | "H" | "m" | "s" | string;
  index: number;
}

export function parseDateFormatSetting(setting: string): DateFormatSetting[] {
  const result: DateFormatSetting[] = [];
  const map: Record<string, number> = {};
  for (const index in setting.split("")) {
    const value = setting[index];
    map[value] = map[value] !== undefined ? map[value] + 1 : 0;
    result.push({ value, index: map[value] });
  }
  return result;
}

export function formatDate(
  value: number | string | Date,
  formatSetting = "YYYY-MM-DD HH:mm:ss"
): string {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear().toString();
  const month = formatNum(date.getMonth() + 1);
  const day = formatNum(date.getDate());
  const hour = formatNum(date.getHours());
  const minute = formatNum(date.getMinutes());
  const second = formatNum(date.getSeconds());
  const map = { Y: year, M: month, D: day, H: hour, m: minute, s: second };
  const setting = parseDateFormatSetting(formatSetting);
  let result = "";
  for (const item of setting) {
    const data = map[item.value];
    const value = data ? data[item.index] : item.value;
    result += value;
  }
  return result;
}

export function downloadBlob(data: BlobPart, type: string, filename: string): void {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = decodeURIComponent(filename);
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

export function getValue<T>(data: T, path: Path<T>) {
  for (const key of path.split(".")) data = data[key];
  return data;
}

export function debounce(event: Function, delay = 300) {
  // eslint-disable-next-line no-undef
  let timer: NodeJS.Timer | undefined;
  return (...args: unknown[]) => {
    timer && clearTimeout(timer);
    timer = setTimeout(() => event(...args), delay);
  };
}

export function throttle(fn: Function, delay = 300) {
  // eslint-disable-next-line no-undef
  let timer: NodeJS.Timer | undefined;
  return (...args: unknown[]) => {
    if (timer) return;
    fn(...args);
    timer = setTimeout(() => (timer = undefined), delay);
  };
}

interface RangeNumProps {
  start: number;
  end: number;
  format?: boolean;
  afterValue?: string;
}
export function rangeNum({ start = 0, end, format = true, afterValue = "" }: RangeNumProps) {
  return Array.from({ length: end - start + 1 }, (_, v) =>
    format ? formatNum(start + v) + afterValue : start + v + afterValue
  );
}

export const formatMutipleNum = (num: number, mutiple = 100, forceNumer = true) => {
  const value = (mutiple === 0 ? num : num / mutiple).toFixed(2);
  return forceNumer ? Number(value) : value;
};

export const formatMoneyPreSubFix = (num: number, mutiple = 0) => {
  const value = formatMutipleNum(num, mutiple, false).toString();
  return value.split(".");
};

export const createImg = (url: string) => {
  return new Promise<HTMLImageElement>((rev, rej) => {
    const img = document.createElement("img");
    img.src = url;
    img.crossOrigin = "Anonymous"; //解决跨域图片问题

    img.onload = () => rev(img);
    img.onerror = e => rej(e);
  });
};

export const copyInfo = async (data?: string | { type: "img"; url: string }) => {
  try {
    if (!data) return;
    // @ts-ignore
    const permissions = await navigator.permissions.query({ name: "clipboard-write" });
    if (permissions.state === "granted") {
      if (typeof data === "string") await navigator.clipboard.writeText(data);
      else if (data.type === "img") {
        const res = await fetch(data.url, { headers: { "Response-Type": "blob" } });
        const blob = await res.blob();

        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
      }
    } else {
      const createCopyDom = async () => {
        if (typeof data === "string") {
          const text = document.createElement("span");
          text.innerText = data;
          return text;
        } else {
          const img = await createImg(data.url);
          return img;
        }
      };
      const copyDom = await createCopyDom();
      const selection = window.getSelection()!;
      if (selection.rangeCount > 0) selection.removeAllRanges();
      const range = document.createRange();
      document.body.appendChild(copyDom);
      range.selectNode(copyDom); //传入dom
      selection.addRange(range);
      document.execCommand("copy");
      document.body.removeChild(copyDom);
    }
    message.success("复制成功");
  } catch (error) {
    console.log("copy error:", error);

    message.error("复制失败");
  }
};
