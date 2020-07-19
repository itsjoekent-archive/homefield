export default function useAuthorizationGate() {
  const [hasVerifiedToken, setHasVerifiedToken] = React.useState(false);

  const { dispatch, authentication } = useApplicationContext();
  const hasValidAuth = !!authentication.token && !!authentication.account;

  React.useEffect(() => {
    let cancel = false;
    const cachedToken = localStorage.getItem('token');

    if (!hasValidAuth && cachedToken && !hasVerifiedToken) {
      // TODO: Verify cached token

      setHasVerifiedToken(true);

      dispatch((state) => ({
        ...state,
        authentication: {
          ...state.authentication,
          token: cachedToken,
        },
      }));

      // TODO: Redirect to login page if authorization fails
    }

    return () => cancel = true;
  }, [
    hasValidAuth,
    dispatch,
    hasVerifiedToken,
    setHasVerifiedToken,
  ]);

  React.useEffect(() => {
    const cachedToken = localStorage.getItem('token');

    // TODO: Check if this is the login page
    if (!hasValidAuth && !cachedToken) {
      // TODO: Redirect to login page
    }
  }, [
    hasValidAuth,
  ]);
}
