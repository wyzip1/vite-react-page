import { Form } from "antd";
import styled from "styled-components";

export const SearchForm = styled(Form)`
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 12px;

  &.ant-form-inline > .search-item {
    flex: 0 0 auto;
    max-width: 100%;
    margin: 0;

    & > .ant-form-item-row {
      width: 100%;
      flex-wrap: nowrap;
    }
  }

  & > .search-actions {
    flex: 0 0 auto;
    min-width: max-content;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
  }
`;
