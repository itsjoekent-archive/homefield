import React from 'react';

export const defaultApplicationContext = {
  authentication: {
    account: null,
    token: null,
  },
  snacks: [],
};

export function pushSnackError(dispatch, error) {
  dispatch((copy) => ({
    ...copy,
    snacks: [
      ...copy.snacks,
      {
        id: Date.now(),
        type: 'error',
        message: error.message,
      }
    ],
  }))
}

const ApplicationContext = React.createContext(defaultApplicationContext);

export default ApplicationContext;

export function useApplicationContext() {
  const context = React.useContext(ApplicationContext);

  return context;
}
