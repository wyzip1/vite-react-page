import styled from "styled-components";

export const SearchStyled = styled.div<{ defaultLabelWidth: string }>`
  --default-label-width: ${props => props.defaultLabelWidth};

  & > .search-row {
    & ~ .search-row {
      margin-top: 10px;
    }
    display: flex;
    align-items: center;
    flex-wrap: wrap;
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

  & > .action-control {
    margin-top: 10px;
    padding-left: calc(var(--default-label-width, 60px) + 10px);
    display: flex;
    column-gap: 10px;
  }
`;
