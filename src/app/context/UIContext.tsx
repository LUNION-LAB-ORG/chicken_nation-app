import React, { createContext, useContext, useState } from "react";

type UIContextType = {
  isDrawerVisible: boolean;
  showDrawer: () => void;
  hideDrawer: () => void;
};

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const showDrawer = () => setIsDrawerVisible(true);
  const hideDrawer = () => setIsDrawerVisible(false);

  return (
    <UIContext.Provider
      value={{
        isDrawerVisible,
        showDrawer,
        hideDrawer,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}

export default UIProvider; 