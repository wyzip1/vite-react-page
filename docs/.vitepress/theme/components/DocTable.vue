<script setup lang="ts">
import { computed, ref } from "vue";

type CellValue =
  | string
  | {
      text?: string;
      code?: string;
      link?: string;
      badge?: string;
    };

interface Column {
  key: string;
  title: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  wrap?: boolean;
  align?: "left" | "center" | "right";
}

interface Row {
  id: string;
  cells: Record<string, CellValue>;
  children?: Row[];
}

const props = withDefaults(
  defineProps<{
    columns: Column[];
    rows: Row[];
    defaultExpanded?: boolean;
    rowKey?: string;
  }>(),
  {
    defaultExpanded: false,
    rowKey: "id",
  },
);

const expanded = ref<Set<string>>(new Set());

const allRows = computed(() => {
  const result: Array<Row & { depth: number }> = [];
  const walk = (rows: Row[], depth: number) => {
    rows.forEach(row => {
      result.push({ ...row, depth });
      if (row.children?.length) walk(row.children, depth + 1);
    });
  };
  walk(props.rows, 0);
  return result;
});

if (props.defaultExpanded) {
  expanded.value = new Set(allRows.value.filter(row => row.children?.length).map(row => row.id));
}

const visibleRows = computed(() => {
  const result: Array<Row & { depth: number }> = [];
  const walk = (rows: Row[], depth: number) => {
    rows.forEach(row => {
      result.push({ ...row, depth });
      if (row.children?.length && expanded.value.has(row.id)) {
        walk(row.children, depth + 1);
      }
    });
  };
  walk(props.rows, 0);
  return result;
});

const columnWidths = computed(() => {
  return props.columns.map((column, index) => {
    if (column.width) return column.width;

    const lengths = allRows.value.map(row => cellText(row.cells[column.key]).length);
    const maxLength = Math.max(column.title.length, ...lengths, 1);
    const depthPadding = index === 0 ? Math.max(...allRows.value.map(row => row.depth), 0) * 22 : 0;
    const controlPadding = index === 0 ? 34 : 0;
    const base = Math.ceil(maxLength * 8.2 + depthPadding + controlPadding + 32);
    const min = column.minWidth ?? (column.wrap ? 220 : 96);
    const max = column.maxWidth ?? (column.wrap ? 520 : 340);
    return Math.max(min, Math.min(base, max));
  });
});

const tableWidth = computed(() => columnWidths.value.reduce((sum, width) => sum + width, 0));

function toggle(row: Row) {
  if (!row.children?.length) return;
  const next = new Set(expanded.value);
  if (next.has(row.id)) next.delete(row.id);
  else next.add(row.id);
  expanded.value = next;
}

function isExpanded(row: Row) {
  return expanded.value.has(row.id);
}

function cellText(value: CellValue) {
  return typeof value === "string" ? value : value?.text || value?.code || value?.badge || "";
}

function cellClass(column: Column) {
  return {
    "doc-table__cell": true,
    "doc-table__cell--wrap": column.wrap,
    [`doc-table__cell--${column.align || "left"}`]: true,
  };
}
</script>

<template>
  <div class="doc-table">
    <table :style="{ width: `${tableWidth}px` }">
      <colgroup>
        <col v-for="(column, index) in columns" :key="column.key" :style="{ width: `${columnWidths[index]}px` }" />
      </colgroup>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" :class="{ 'is-wrap': column.wrap }">
            {{ column.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in visibleRows" :key="row[rowKey]" :class="{ 'is-child': row.depth > 0 }">
          <td v-for="(column, columnIndex) in columns" :key="column.key" :class="{ 'is-wrap': column.wrap }">
            <div
              :class="cellClass(column)"
              :style="columnIndex === 0 ? { paddingLeft: `${row.depth * 22}px` } : undefined"
            >
              <button
                v-if="columnIndex === 0 && row.children?.length"
                class="doc-table__toggle"
                type="button"
                :aria-label="isExpanded(row) ? '折叠行' : '展开行'"
                :aria-expanded="isExpanded(row)"
                @click="toggle(row)"
              >
                {{ isExpanded(row) ? "−" : "+" }}
              </button>
              <span v-else-if="columnIndex === 0" class="doc-table__spacer" />

              <a
                v-if="typeof row.cells[column.key] !== 'string' && row.cells[column.key]?.link"
                :href="row.cells[column.key].link"
              >
                {{ cellText(row.cells[column.key]) }}
              </a>
              <code
                v-else-if="typeof row.cells[column.key] !== 'string' && row.cells[column.key]?.code"
              >
                {{ row.cells[column.key].code }}
              </code>
              <span
                v-else-if="typeof row.cells[column.key] !== 'string' && row.cells[column.key]?.badge"
                class="doc-table__badge"
              >
                {{ row.cells[column.key].badge }}
              </span>
              <span v-else>{{ cellText(row.cells[column.key]) }}</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
