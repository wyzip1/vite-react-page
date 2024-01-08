import styled from "styled-components";

export const SearchStyled = styled.div<{
  defaultLabelWidth: string;
  inline?: boolean;
  autoWrap?: boolean;
}>`
  width: 100%;
  --default-label-width: ${props => props.defaultLabelWidth};
  font-size: var(--base-size, 14px);
  display: ${props => (props.inline ? "flex" : "block")};
  justify-content: space-between;

  & > .input-content {
    & > .search-row {
      & ~ .search-row {
        margin-top: 10px;
      }
      display: flex;
      align-items: center;
      row-gap: 10px;
      flex-wrap: ${props => (props.autoWrap ? "wrap" : "nowrap")};
      & > .search-item {
        display: flex;
        align-items: center;

        & > .label {
          flex-shrink: 0;
          text-align: right;
          width: var(--default-label-width, 60px);
        }

        & > .value {
          margin-left: 10px;
          min-width: 140px;
        }
      }
    }
  }

  & > .action-control,
  & > .inline-ext-btns {
    margin-top: 10px;
    padding-left: calc(var(--default-label-width, 60px) + 10px);
    display: flex;
    column-gap: 10px;
  }

  & > .inline-ext-btns {
    width: 100%;
  }
`;
