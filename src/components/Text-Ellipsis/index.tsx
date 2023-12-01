import { Tooltip, TooltipProps } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { TextEllipsisStyled } from "./styled";

interface TextEllipsisProps {
  width?: number | string;
  size?: number | string;
  line?: number;
  children: React.ReactNode;
  toolTipProps?: TooltipProps;
  toolTipWidth?: number;
  className?: string;
  autoResize?: boolean;
  style?: React.CSSProperties;
}

export default function TextEllipsis({
  line = 1,
  width = "100%",
  size = 14,
  children,
  toolTipProps,
  toolTipWidth = 400,
  className,
  autoResize = true,
  style,
}: TextEllipsisProps) {
  const [hasOverflow, setHasOverflow] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const updateOverflow = useCallback(() => {
    if (!contentRef.current) return;
    const heightOverflow = contentRef.current.scrollHeight > contentRef.current.clientHeight;
    const widthOverflow = contentRef.current.scrollWidth > contentRef.current.offsetWidth;
    setHasOverflow(widthOverflow || heightOverflow);
  }, []);

  useEffect(() => {
    updateOverflow();
    if (!autoResize) return;
    window.removeEventListener("resize", updateOverflow);
    window.addEventListener("resize", updateOverflow);
    return () => {
      window.removeEventListener("resize", updateOverflow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoResize]);

  return (
    <TextEllipsisStyled
      className={className}
      style={style}
      ref={contentRef}
      line={line}
      width={width}
      size={size}
    >
      {hasOverflow ? (
        <Tooltip
          placement="top"
          style={{ width: toolTipWidth }}
          title={children}
          {...toolTipProps}
        >
          {children}
        </Tooltip>
      ) : (
        children
      )}
    </TextEllipsisStyled>
  );
}
