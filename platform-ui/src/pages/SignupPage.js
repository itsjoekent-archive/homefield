import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from '@reach/router';
import Facade from 'components/Facade';
import FacadeBlock, { Block } from 'components/FacadeBlock';
import FormController from 'components/forms/FormController';
import EmailInput from 'components/forms/EmailInput';
import PasswordInput from 'components/forms/PasswordInput';
import TextInput from 'components/forms/TextInput';
import SubmitButton from 'components/forms/SubmitButton';
import FormErrorMessage from 'components/forms/FormErrorMessage';
import requiredTextValidator from 'components/forms/requiredTextValidator';
import { LightBlueButton, BoldTextButton } from 'components/Buttons';
import useApiFetch from 'hooks/useApiFetch';
import { useApplicationContext } from 'ApplicationContext';
import {
  DASHBOARD_ROUTE,
  LOGIN_ROUTE,
  FORGOT_PASSWORD_ROUTE,
} from 'routes';

const Container = styled.div`
  ${Block} {
    margin-bottom: 24px;
  }
`;

const SignupButton = styled(LightBlueButton)`
  margin-left: auto;
  margin-right: auto;
`;

export default function SignupPage() {
  const { authentication, dispatch } = useApplicationContext();

  const apiFetch = useApiFetch(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (authentication.token) {
      navigate(DASHBOARD_ROUTE);
    }
    // eslint-disable-next-line
  }, []);

  async function onSignup(state) {
    const { values: { firstName, email, password } } = state;

    const response = await apiFetch('/v1/accounts', {
      method: 'post',
      body: JSON.stringify({
        firstName,
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
    <Container>
      <Facade>
        <FacadeBlock title="Create a new account">
          <FormController formId="signup" asyncOnSubmit={onSignup}>
            <TextInput
              fieldId="firstName"
              label="First name"
              onValueChange={requiredTextValidator('firstName', 'First name')}
            />
            <EmailInput />
            <PasswordInput />
            <SubmitButton
              renderButton={(buttonProps) => (
                <SignupButton {...buttonProps}>Create account</SignupButton>
              )}
            />
            <FormErrorMessage />
          </FormController>
        </FacadeBlock>
        <BoldTextButton>
          <Link to={LOGIN_ROUTE}>Log in to an existing account</Link>
        </BoldTextButton>
        <BoldTextButton>
          <Link to={FORGOT_PASSWORD_ROUTE}>Forgot Password</Link>
        </BoldTextButton>
      </Facade>
    </Container>
  );
}
