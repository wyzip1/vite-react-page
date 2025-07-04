import { GlobalToken } from "antd";
import styled from "styled-components";

export const SortItemStyled = styled.div<{
  token: GlobalToken;
  error?: boolean;
}>`
  --line-type: ${props => props.token.lineType};
  --line-width: ${props => props.token.lineWidth}px;
  --color-border: ${props => (props.error ? props.token.colorError : props.token.colorBorder)};
  --border-radius: ${props => props.token.borderRadius}px;
  --transition: ${props => props.token.motionDurationSlow};

  & .content {
    position: relative;
    width: 102px;
    height: 102px;
    box-sizing: border-box;
    padding: 8px;
    border: var(--line-width) var(--line-type) var(--color-border);
    border-radius: var(--border-radius);
    background-color: #fff;
    position: relative;

    &.uploading {
      display: flex;
      align-items: center;
      flex-direction: column;
      padding-top: 25px;

      & .percent {
        margin-top: 10px;
        width: 100%;
        background-color: ${props =>
          props.token.Progress?.remainingColor || "rgba(0, 0, 0, 0.06)"};
        border-radius: ${props => props.token.Progress?.lineBorderRadius || "100px"};

        &::before {
          content: "";
          display: block;
          width: var(--percent);
          height: 2px;
          transition: width var(--transition);
          background-color: ${props => props.token.Progress?.defaultColor || props.token.blue};
        }
      }
    }

    & .upload-img {
      transition: var(--transition);
      user-select: none;
    }

    &:hover {
      & .upload-img {
        filter: brightness(60%);
      }

      & .actions {
        opacity: 1;
      }
    }
  }
`;
