import React from "react";
import { TagViewsStyled } from "./styled";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useLocation, useNavigate } from "react-router-dom";
import { CatchRouter } from "@/store/global";
import { theme } from "antd";

interface TagItemProps {
  label: string;
  path: string;
}

const TagItem: React.FC<TagItemProps> = ({ label, path }) => {
  const Location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      className={`tag-item ${Location.pathname === path ? "active" : ""}`}
      onClick={() => navigate(path)}
    >
      {label}
    </div>
  );
};

const TagViews: React.FC = () => {
  const { token } = theme.useToken();

  const catchRouters = useSelector<RootState, CatchRouter[]>(
    state => state.global.catchRouters
  );
  return (
    <TagViewsStyled primary={token.colorPrimary}>
      {catchRouters.map(item => (
        <TagItem key={item.path} label={item.title} path={item.path} />
      ))}
    </TagViewsStyled>
  );
};

export default TagViews;
