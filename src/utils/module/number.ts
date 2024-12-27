export function formatNum(num: number, fixed = 2): string {
  const value = num.toString();
  if (fixed <= value.length) return value;
  const preload = Array.from({ length: fixed - value.length }, () => "0").join("");
  return preload + value;
}

export const formatMutipleNum = (num: number, mutiple = 100, forceNumer = true) => {
  const value = (mutiple === 0 ? num : num / mutiple).toFixed(2);
  return forceNumer ? Number(value) : value;
};

export const formatMoneyPreSubFix = (num: number, mutiple = 0) => {
  const value = formatMutipleNum(num, mutiple, false).toString();
  return value.split(".");
};

interface RangeNumProps {
  start: number;
  end: number;
  format?: boolean;
  afterValue?: string;
}
export function rangeNum({ start = 0, end, format = true, afterValue = "" }: RangeNumProps) {
  return Array.from({ length: end - start + 1 }, (_, v) => {
    let value: number | string = start + v;
    if (format) value = formatNum(value);
    if (afterValue) value += afterValue;
    return value;
  });
}
