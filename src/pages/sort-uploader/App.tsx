import UploadSorter from "@/components/UploadSorter";
import AppStyled from "@/store/AppStyled";
import { UploadFile } from "antd";
import React, { useEffect, useState } from "react";

const App: React.FC = () => {
  const [value, setValue] = useState<UploadFile<any>[]>([]);

  useEffect(() => {
    console.log("value", value);
  }, [value]);

  return (
    <AppStyled style={{ width: 800 }} className="overflow-auto">
      <UploadSorter
        value={value}
        multiple
        action={"http://localhost:5050/upload/profile"}
        name="file"
        onChange={list =>
          setValue(
            list.map(v => ({ ...v, url: v.status === "done" ? v.response?.url : undefined })),
          )
        }
      />
    </AppStyled>
  );
};

export default App;
