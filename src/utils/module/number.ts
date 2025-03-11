export function formatNum(num: number, fixed = 2): string {
  const value = num.toString();
  if (fixed <= value.length) return value;
  const preload = Array.from({ length: fixed - value.length }, () => "0").join("");
  return preload + value;
}

export const formatMutipleNum = (
  num: number | undefined | null,
  mutiple = 100,
  forceNumer = true,
  fixed = 2,
) => {
  if (typeof num !== "number") return num;
  const value = (mutiple === 0 ? num : num / mutiple).toFixed(fixed);
  return forceNumer ? Number(value) : value;
};

export const formatMoneyPreSubFix = (num: number, mutiple = 0) => {
  const value = formatMutipleNum(num, mutiple, false)?.toString();
  return value?.split(".") || [];
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
