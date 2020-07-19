import React from 'react';

export const defaultApplicationContext = {
  authentication: {
    account: null,
    token: null,
  },
};

const ApplicationContext = React.createContext(defaultApplicationContext);

export default ApplicationContext;

export function useApplicationContext() {
  const context = React.useContext(ApplicationContext);

  return context;
}