import { Form } from "antd";
import styled from "styled-components";

export const SearchForm = styled(Form)<{
  $labelWidth: string;
  $minItemWidth: string;
  $maxItemsPerRow: number;
  $autoWrap: boolean;
}>`
  width: 100%;
  --search-label-width: ${props => props.$labelWidth};
  --search-item-min-width: ${props => props.$minItemWidth};
  --search-item-width: ${props =>
    `calc((100% - ${(props.$maxItemsPerRow - 1) * 12}px) / ${props.$maxItemsPerRow})`};
  display: flex;
  align-items: center;
  flex-wrap: ${props => (props.$autoWrap ? "wrap" : "nowrap")};
  gap: 10px 12px;

  &.ant-form-inline > .search-item {
    flex: 0 0 var(--search-item-width);
    min-width: min(100%, var(--search-item-min-width));
    margin: 0;

    & > .ant-form-item-row {
      width: 100%;
      flex-wrap: nowrap;
    }

    .ant-form-item-label {
      flex: 0 0 var(--search-label-width);
      max-width: var(--search-label-width);
      padding: 0 10px 0 0;
    }

    .ant-form-item-control {
      min-width: 0;
      flex: 1 1 0;
    }
  }

  & > .search-actions {
    flex: 0 0 var(--search-item-width);
    min-width: max-content;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
  }
`;
