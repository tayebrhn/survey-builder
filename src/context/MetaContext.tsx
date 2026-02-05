import React, { createContext, useContext } from "react";
import { useMeta } from "../hooks/";

const MetaContext = createContext<ReturnType<typeof useMeta> | null>(null);

export const MetaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const metaState = useMeta();
  return (
    <MetaContext.Provider value={metaState}>
      {children}
    </MetaContext.Provider>
  );
};

export const useMetaContext = () => {
  const ctx = useContext(MetaContext);
  if (!ctx) {
    throw new Error("useMetaContext must be used inside MetaProvider");
  }
  return ctx;
};
