import styled from "styled-components";

export const TagViewsStyled = styled.div<{
  primary: string;
}>`
  margin: 10px 16px;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  column-gap: 10px;

  padding-left: 3px;

  & .tag-item {
    font-size: 12px;
    padding: 0 15px;
    cursor: pointer;
    height: 24px;
    padding-right: 20px;
    text-align: center;
    line-height: 24px;
    background-color: #fff;
    transition: 0.3s;
    box-shadow: 2px 2px 6px #bebebe, -2px -2px 6px #ffffff;
    border-radius: 5px;
    white-space: nowrap;

    &.show {
      animation: tagInAnimation 0.3s forwards ease-in-out;
    }

    &.remove {
      animation: tagOutAnimation 0.3s forwards ease-in-out;

      &.remove-end {
        display: none;
      }
    }

    &.active {
      background-color: ${props => props.primary};
      color: #fff;
    }

    & .close-icon {
      width: 0px;
      transition: all 0.2s;
      margin-right: -10px;
      margin-left: 5px;
      font-size: 11px;
    }

    &:hover .close-icon {
      width: 14px;
    }

    &:hover {
      padding-right: 15px;
    }
  }

  @keyframes tagInAnimation {
    from {
      transform: translateY(5px);
      opacity: 0.3;
    }
    to {
      transform: translate(0);
      opacity: 1;
    }
  }

  @keyframes tagOutAnimation {
    from {
      transform: scale(1);
      opacity: 1;
    }
    to {
      transform: scale(0);
      opacity: 0.3;
    }
  }
`;
