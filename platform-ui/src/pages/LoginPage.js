import React from 'react';
import styled from 'styled-components';
import { useNavigate } from '@reach/router';
import Facade from 'components/Facade';
import FacadeBlock from 'components/FacadeBlock';
import FormController from 'components/forms/FormController';
import EmailInput from 'components/forms/EmailInput';
import PasswordInput from 'components/forms/PasswordInput';
import SubmitButton from 'components/forms/SubmitButton';
import FormErrorMessage from 'components/forms/FormErrorMessage';
import { LightBlueButton } from 'components/Buttons';
import { useApplicationContext } from 'ApplicationContext';
import { DASHBOARD_ROUTE } from 'routes';

const LoginButton = styled(LightBlueButton)`
  margin-left: auto;
  margin-right: auto;
`;

export default function LoginPage() {
  const { authentication, dispatch } = useApplicationContext();

  const navigate = useNavigate();

  React.useEffect(() => {
    if (authentication.token) {
      navigate(DASHBOARD_ROUTE);
    }
    // eslint-disable-next-line
  }, []);

  async function onLogin(state) {
    const { values: { email, password } } = state;

    const response = await fetch(`${process.env.REACT_APP_API_URL}/v1/login`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const json = await response.json();

    if (json && json.error) {
      return {
        formError: json.error,
      };
    }

    if (response.status === 200) {
      const { data: { account, token } } = json;

      dispatch((state) => ({
        ...state,
        account,
        token: token.bearer,
      }));

      localStorage.setItem('token', token.bearer);
      localStorage.setItem('token-expiration', token.expiresAt);

      navigate(DASHBOARD_ROUTE);

      return;
    }
  }

  return (
    <Facade>
      <FacadeBlock title="Sign In To HomeField">
        <FormController formId="login" asyncOnSubmit={onLogin}>
          <EmailInput />
          <PasswordInput />
          <SubmitButton
            renderButton={(buttonProps) => (
              <LoginButton {...buttonProps}>Sign In</LoginButton>
            )}
          />
          <FormErrorMessage />
        </FormController>
      </FacadeBlock>
    </Facade>
  );
}
