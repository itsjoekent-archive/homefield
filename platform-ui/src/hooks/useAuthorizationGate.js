import React from 'react';
import { useNavigate } from '@reach/router';
import { useApplicationContext } from 'ApplicationContext';
import { LOGIN_ROUTE } from 'routes';
import useApiFetch from 'hooks/useApiFetch';

export default function useAuthorizationGate(redirectOnFail = true) {
  const apiFetch = useApiFetch(false);
  const navigate = useNavigate();

  const [hasVerifiedToken, setHasVerifiedToken] = React.useState(false);

  const { dispatch, authentication } = useApplicationContext();
  const hasValidAuth = !!authentication.token && !!authentication.account;

  React.useEffect(() => {
    const cachedToken = localStorage.getItem('token');

    async function validateAuth() {
      const response = await apiFetch('/v1/token/verify', {
        method: 'post',
        headers: {
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
          // TODO: Snack error

          localStorage.removeItem('token');

          if (redirectOnFail) {
            navigate(LOGIN_ROUTE);
          }
        });
    }
    // eslint-disable-next-line
  }, []);

  React.useEffect(() => {
    const cachedToken = localStorage.getItem('token');

    if (!hasValidAuth && !cachedToken && redirectOnFail) {
      navigate(LOGIN_ROUTE);
    }
    // eslint-disable-next-line
  }, []);
}
