import React, { createContext, useEffect, useRef } from "react";

interface KeepAliveContextProps {
  includes?: string[];
  keepElements: Record<string, React.ReactElement>;
}

export const KeepAliveContext = createContext<KeepAliveContextProps>({
  keepElements: {},
});

interface KeepAliveProviderProps extends Partial<KeepAliveContextProps> {
  children: React.ReactNode;
}

const KeepAliveProvider: React.FC<KeepAliveProviderProps> = ({ children, includes }) => {
  const _keepElements = useRef<Record<string, React.ReactElement>>({});

  useEffect(() => {
    if (!includes) return;
    for (const pathname of Object.keys(_keepElements)) {
      if (includes.includes(pathname)) continue;
      delete _keepElements[pathname];
    }
  }, [includes, includes?.length]);

  return (
    <KeepAliveContext.Provider value={{ includes, keepElements: _keepElements.current }}>
      {children}
    </KeepAliveContext.Provider>
  );
};

export default KeepAliveProvider;
