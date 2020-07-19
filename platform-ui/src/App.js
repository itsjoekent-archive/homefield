import React from 'react';
import { ThemeProvider } from 'styled-components';
import { Router } from '@reach/router';
import ApplicationContext, { defaultApplicationContext } from './ApplicationContext';
import theme from './theme';
import {
  FORGOT_PASSWORD_ROUTE,
  LOGIN_ROUTE,
  SIGNUP_ROUTE,
} from './routes';

const ForgotPasswordPage = React.lazy(() => import('pages/ForgotPasswordPage'));
const LoginPage = React.lazy(() => import('pages/LoginPage'));
const NotFoundPage = React.lazy(() => import('pages/NotFoundPage'));
const SignupPage = React.lazy(() => import('pages/SignupPage'));

function App() {
  const [state, dispatch] = React.useReducer(
    (state, action) => action(state),
    {
      ...defaultApplicationContext,
      authentication: {
        ...defaultApplicationContext.authentication,
        token: localStorage.getItem('token'),
      },
    },
  );

  const contextValue = { ...state, dispatch };

  return (
    <ApplicationContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <React.Suspense fallback={null}>
          <Router>
            <LoginPage path={LOGIN_ROUTE} />
            <SignupPage path={SIGNUP_ROUTE} />
            <ForgotPasswordPage path={FORGOT_PASSWORD_ROUTE} />
            <NotFoundPage path="*" />
          </Router>
        </React.Suspense>
      </ThemeProvider>
    </ApplicationContext.Provider>
  );
}

export default App;
