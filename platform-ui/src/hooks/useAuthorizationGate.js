import React from 'react';
import { useLocation, useNavigate } from '@reach/router';
import { useApplicationContext } from 'ApplicationContext';
import { LOGIN_ROUTE } from 'routes';

export default function useAuthorizationGate() {
  const navigate = useNavigate();
  const location = useLocation();

  const [hasVerifiedToken, setHasVerifiedToken] = React.useState(false);

  const { dispatch, authentication } = useApplicationContext();
  const hasValidAuth = !!authentication.token && !!authentication.account;

  React.useEffect(() => {
    const cachedToken = localStorage.getItem('token');

    async function validateAuth() {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/v1/token/verify`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cachedToken}`,
        },
      });

      const json = await response.json();

      if (json.error || response.status !== 200) {
        throw new Error(json.error || 'Failed to verify token');
      }

      return json.data;
    }

    if (!hasValidAuth && cachedToken && !hasVerifiedToken) {
      validateAuth()
        .then(({ token, account }) => {
          setHasVerifiedToken(true);

          dispatch((state) => ({
            ...state,
            authentication: {
              ...state.authentication,
              token: token.bearer,
              account,
            },
          }));
        })
        .catch((error) => {
          console.error(error);

          localStorage.removeItem('token');
          navigate(LOGIN_ROUTE);
        });
    }
  }, []);

  React.useEffect(() => {
    const cachedToken = localStorage.getItem('token');

    if (!hasValidAuth && !cachedToken) {
      navigate(LOGIN_ROUTE);
    }
  }, []);
}
