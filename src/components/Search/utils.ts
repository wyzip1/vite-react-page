import type { SearchConfig, SearchValues } from "./types";

export function toCssLength(length?: number | string): string | undefined {
  return typeof length === "number" ? `${length}px` : length;
}

export function createInitialValues(config: SearchConfig): SearchValues {
  return config.reduce<SearchValues>((values, option) => {
    values[option.key] = option.defaultValue;
    return values;
  }, {});
}
