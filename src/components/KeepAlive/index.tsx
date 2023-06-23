import React, { createContext, useEffect, useRef } from "react";

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
  const keepElements = useRef<Record<string, React.ReactElement>>({});

  useEffect(() => {
    if (!includes) return;
    for (const pathname of Object.keys(keepElements.current)) {
      if (includes.some(item => item.path === pathname)) continue;
      delete keepElements.current[pathname];
    }
  }, [includes, includes?.length]);

  return (
    <KeepAliveContext.Provider value={{ includes, keepElements: keepElements.current }}>
      {children}
    </KeepAliveContext.Provider>
  );
};

export default KeepAliveProvider;
