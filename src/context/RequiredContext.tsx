import React, { createContext, useContext } from "react";

// Context to control global required behavior
const RequiredContext = createContext({ requiredByDefault: true });

// Hook for convenience
export const useRequired = () => useContext(RequiredContext);

// Provider to wrap your app
export const RequiredProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <RequiredContext.Provider value={{ requiredByDefault: true }}>
      {children}
    </RequiredContext.Provider>
  );
};
