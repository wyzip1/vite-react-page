import React, { useState } from "react";

interface IKeepAliveContext {
  catchNodes: { [key: string]: React.ReactNode };
  addCatchNode: (key: string, node: React.ReactNode) => void;
  removeNode: (key: string) => void;
}

export const KeepAliveContext = React.createContext<IKeepAliveContext>({
  catchNodes: {},
  addCatchNode: () => {},
  removeNode: () => {},
});

const KeepAliveProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [catchNodes, setCatchNodes] = useState<{ [key: string]: React.ReactNode }>({});

  function addCatchNode(key: string, node: React.ReactNode) {
    setCatchNodes(catchNodes => ({ ...catchNodes, [key]: node }));
  }

  function removeNode(key: string) {
    delete catchNodes[key];
    setCatchNodes({ ...catchNodes });
  }

  return (
    <KeepAliveContext.Provider value={{ catchNodes, addCatchNode, removeNode }}>
      {children}
    </KeepAliveContext.Provider>
  );
};

export default KeepAliveProvider;
