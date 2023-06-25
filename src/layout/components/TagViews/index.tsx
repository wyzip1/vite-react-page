import React, { useState } from "react";
import { TagViewsStyled } from "./styled";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { useLocation, useNavigate } from "react-router-dom";
import { CatchRouter, REMOVE_CATCH_ROUTERS } from "@/store/global";
import { theme } from "antd";
import { CloseOutlined } from "@ant-design/icons";

interface TagItemProps {
  label: string;
  path: string;
  onClose?: () => void;
}

const TagItem: React.FC<TagItemProps> = ({ label, path, onClose }) => {
  const Location = useLocation();
  const navigate = useNavigate();

  const [isRemove, setIsRemove] = useState<boolean>(false);
  const [removeEnd, setRemoveEnd] = useState<boolean>(false);

  const remove: React.MouseEventHandler<HTMLSpanElement> = e => {
    e.stopPropagation();
    setIsRemove(true);
    setTimeout(() => {
      setRemoveEnd(true);
      onClose?.();
    }, 300);
  };

  return (
    <div
      className={`tag-item ${Location.pathname === path ? "active" : ""}  ${
        isRemove ? "remove" : "show"
      } ${removeEnd ? "remove-end" : ""}`}
      onClick={() => navigate(path)}
    >
      {label}
      <CloseOutlined className="close-icon" onClick={remove} />
    </div>
  );
};

const TagViews: React.FC = () => {
  const { token } = theme.useToken();

  const catchRouters = useSelector<RootState, CatchRouter[]>(
    state => state.global.catchRouters
  );

  const dispatch = useDispatch();

  function onClose(item: CatchRouter) {
    dispatch(REMOVE_CATCH_ROUTERS(item.path));
  }

  return (
    <TagViewsStyled primary={token.colorPrimary}>
      {catchRouters.map(item => (
        <TagItem
          key={item.path}
          label={item.title}
          path={item.path}
          onClose={() => onClose(item)}
        />
      ))}
    </TagViewsStyled>
  );
};

export default TagViews;
