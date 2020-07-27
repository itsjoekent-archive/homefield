import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from '@reach/router';
import Facade from 'components/Facade';
import FacadeBlock, { Block } from 'components/FacadeBlock';
import FormController from 'components/forms/FormController';
import EmailInput from 'components/forms/EmailInput';
import PasswordInput from 'components/forms/PasswordInput';
import SubmitButton from 'components/forms/SubmitButton';
import FormErrorMessage from 'components/forms/FormErrorMessage';
import { LightBlueButton, BoldTextButton } from 'components/Buttons';
import useApiFetch from 'hooks/useApiFetch';
import { useApplicationContext } from 'ApplicationContext';
import {
  DASHBOARD_DEFAULT_ROUTE,
  FORGOT_PASSWORD_ROUTE,
  SIGNUP_ROUTE,
} from 'routes';

const Container = styled.div`
  ${Block} {
    margin-bottom: 24px;
  }
`;

const LoginButton = styled(LightBlueButton)`
  margin-left: auto;
  margin-right: auto;
`;

export default function LoginPage() {
  const { authentication, dispatch } = useApplicationContext();

  const apiFetch = useApiFetch(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (authentication.token) {
      navigate(DASHBOARD_DEFAULT_ROUTE);
    }
    // eslint-disable-next-line
  }, []);

  async function onLogin(state) {
    const { values: { email, password } } = state;

    const response = await apiFetch('/v1/login', {
      method: 'post',
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

      navigate(DASHBOARD_DEFAULT_ROUTE);

      return;
    }
  }

  return (
    <Container>
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
        <BoldTextButton>
          <Link to={SIGNUP_ROUTE}>Create a new account</Link>
        </BoldTextButton>
        <BoldTextButton>
          <Link to={FORGOT_PASSWORD_ROUTE}>Forgot Password</Link>
        </BoldTextButton>
      </Facade>
    </Container>
  );
}
