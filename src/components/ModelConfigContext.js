import React, { createContext, useState } from 'react';

// Create a context with a default empty model configuration
export const ModelConfigContext = createContext({
  modelConfig: { layers: [] },
  setModelConfig: () => {},
});

// Context provider component
export const ModelConfigProvider = ({ children }) => {
  const [modelConfig, setModelConfig] = useState({ layers: [] });

  // The value passed to the provider includes the model configuration and the function to update it
  const contextValue = {
    modelConfig,
    setModelConfig,
  };

  return (
    <ModelConfigContext.Provider value={contextValue}>
      {children}
    </ModelConfigContext.Provider>
  );
};

export default ModelConfigContext;