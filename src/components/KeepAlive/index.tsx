import React, { createContext, useEffect, useState } from "react";

interface KeepAliveContextProps {
  includes?: Array<{ title: string; path: string }>;
  keepElements: Record<string, React.ReactElement>;
}

export const KeepAliveContext = createContext<KeepAliveContextProps>({
  keepElements: {},
});

interface KeepAliveProviderProps extends Partial<KeepAliveContextProps> {
  children: React.ReactNode;
}

const KeepAliveProvider: React.FC<KeepAliveProviderProps> = ({ children, includes }) => {
  const [keepElements, setKeepElements] = useState<Record<string, React.ReactElement>>({});

  useEffect(() => {
    if (!includes) return;
    for (const pathname of Object.keys(keepElements)) {
      if (includes.some(item => item.path === pathname)) continue;
      delete keepElements[pathname];
    }
    setKeepElements({ ...keepElements });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includes, includes?.length]);

  return (
    <KeepAliveContext.Provider value={{ includes, keepElements }}>
      {children}
    </KeepAliveContext.Provider>
  );
};

export default KeepAliveProvider;
