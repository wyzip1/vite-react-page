import { Form } from "antd";
import styled from "styled-components";

export const SearchForm = styled(Form)<{
  $maxItemsPerRow: number;
  $autoWrap: boolean;
}>`
  width: 100%;
  --search-item-width: ${props =>
    `calc((100% - ${(props.$maxItemsPerRow - 1) * 12}px) / ${props.$maxItemsPerRow})`};
  display: flex;
  align-items: center;
  flex-wrap: ${props => (props.$autoWrap ? "wrap" : "nowrap")};
  gap: 10px 12px;

  &.ant-form-inline > .search-item {
    flex: 0 0 var(--search-item-width);
    max-width: 100%;
    margin: 0;

    & > .ant-form-item-row {
      width: 100%;
      flex-wrap: nowrap;
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
