import React from 'react';
import { ThemeProvider } from 'styled-components';
import { Router } from '@reach/router';
import ApplicationContext, { defaultApplicationContext } from 'ApplicationContext';
import theme from 'theme';
import {
  DASHBOARD_DEFAULT_ROUTE,
  DASHBOARD_CAMPAIGN_ROUTE,
  EDIT_ACCOUNT_SETTINGS_ROUTE,
  FORGOT_PASSWORD_ROUTE,
  LOGIN_ROUTE,
  PROFILE_ROUTE,
  SIGNUP_ROUTE,
} from 'routes';

const AccountSettingsPage = React.lazy(() => import('pages/AccountSettingsPage'));
const DashboardPage = React.lazy(() => import('pages/DashboardPage'));
const ForgotPasswordPage = React.lazy(() => import('pages/ForgotPasswordPage'));
const LoginPage = React.lazy(() => import('pages/LoginPage'));
const NotFoundPage = React.lazy(() => import('pages/NotFoundPage'));
const ProfilePage = React.lazy(() => import('pages/ProfilePage'));
const SignupPage = React.lazy(() => import('pages/SignupPage'));

function App() {
  const [state, dispatch] = React.useReducer(
    (state, action) => action(state),
    defaultApplicationContext,
  );

  const contextValue = { ...state, dispatch };

  return (
    <ApplicationContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <React.Suspense fallback={null}>
          <Router>
            <DashboardPage path={DASHBOARD_DEFAULT_ROUTE} />
            <DashboardPage path={`${DASHBOARD_CAMPAIGN_ROUTE}/*`} />
            <AccountSettingsPage path={`${EDIT_ACCOUNT_SETTINGS_ROUTE}/*`} />
            <ProfilePage path={PROFILE_ROUTE} />
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
