import React from 'react';
import styled from 'styled-components';
import { Link } from '@reach/router';
import Facade from 'components/Facade';
import FacadeBlock, { Block } from 'components/FacadeBlock';
import FormController from 'components/forms/FormController';
import EmailInput from 'components/forms/EmailInput';
import SubmitButton from 'components/forms/SubmitButton';
import FormErrorMessage from 'components/forms/FormErrorMessage';
import { LightBlueButton, BoldTextButton } from 'components/Buttons';
import useApiFetch from 'hooks/useApiFetch';
import { LOGIN_ROUTE, SIGNUP_ROUTE } from 'routes';

const ForgotPasswordButton = styled(LightBlueButton)`
  margin-left: auto;
  margin-right: auto;
`;

const Container = styled.div`
  ${Block} {
    margin-bottom: 24px;
  }
`;

const HelpText = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: ${({ theme, bold }) => bold ? '600' : theme.type.weight.paragraph};
  text-align: left;
  color: ${({ theme }) => theme.colors.blue.darkest};

  margin-bottom: 24px;
`;

export default function ForgotPasswordPage() {
  const apiFetch = useApiFetch();

  const [hasSubmitted, setHasSubmitted] = React.useState(false);

  async function onSubmit(formState) {
    const { values: { email } } = formState;

    const response = await apiFetch('/v1/accounts/request-password-reset', {
      method: 'post',
      body: JSON.stringify({ email }),
    });

    const json = await response.json();

    if (response.status !== 200) {
      return {
        formError: json.error || 'Failed to send password reset',
      }
    }

    setHasSubmitted(true);
  }

  return (
    <Container>
      <Facade>
        <FacadeBlock title="Forgot Password">
          {hasSubmitted && (
            <HelpText bold>You should recieve a password reset email soon if there is an account associated with this email.</HelpText>
          )}
          {!hasSubmitted && (
            <React.Fragment>
              <HelpText>Enter your account email below and we'll send you a password reset link.</HelpText>
              <FormController formId="forgot-password" asyncOnSubmit={onSubmit}>
                <EmailInput />
                <SubmitButton
                  renderButton={(buttonProps) => (
                    <ForgotPasswordButton {...buttonProps}>Submit</ForgotPasswordButton>
                  )}
                />
                <FormErrorMessage />
              </FormController>
            </React.Fragment>
          )}
        </FacadeBlock>
        <BoldTextButton>
          <Link to={SIGNUP_ROUTE}>Create a new account</Link>
        </BoldTextButton>
        <BoldTextButton>
          <Link to={LOGIN_ROUTE}>Log In To Existing Account</Link>
        </BoldTextButton>
      </Facade>
    </Container>
  );
}
