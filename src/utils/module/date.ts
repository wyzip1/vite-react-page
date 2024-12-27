import { formatNum } from "./number";

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
  formatSetting = "YYYY-MM-DD HH:mm:ss",
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
