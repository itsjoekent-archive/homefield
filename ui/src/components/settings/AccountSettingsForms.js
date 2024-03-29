import React from 'react';
import styled from 'styled-components';
import { Link } from '@reach/router';
import { LightBlueButton } from 'components/Buttons';
import FormController, { resetForm } from 'components/forms/FormController';
import EmailInput from 'components/forms/EmailInput';
import PasswordInput from 'components/forms/PasswordInput';
import SubmitButton from 'components/forms/SubmitButton';
import FormErrorMessage from 'components/forms/FormErrorMessage';
import useApiFetch from 'hooks/useApiFetch';
import { useApplicationContext } from 'ApplicationContext';
import { FORGOT_PASSWORD_ROUTE } from 'routes';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  max-width: 400px;

  margin-bottom: 72px;
`;

const Header = styled.h2`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.header};
  font-weight: ${({ theme }) => theme.type.weight.header};;
  text-align: left;
  color: ${({ theme }) => theme.colors.blue.darkest};

  margin-bottom: 24px;
`;

const Paragraph = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: ${({ theme }) => theme.type.weight.paragraph};;
  text-align: left;
  color: ${({ theme }) => theme.colors.mono.black};

  margin-bottom: 24px;
`;

const EmailPlaceholder = styled.b`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: ${({ theme }) => theme.type.weight.header};;
  text-align: left;
  color: ${({ theme }) => theme.colors.mono.black};
`;

const ForgotPasswordLink = styled.span`
  display: block;
  margin-top: -16px;
  margin-bottom: 24px;

  a {
    font-family: ${({ theme }) => theme.font};
    font-size: 14px;
    font-weight: 300;
    text-align: left;
    color: ${({ theme }) => theme.colors.blue.dark};
  }
`;

export default function AccountSettingsForms() {
  const { authentication: { account }, dispatch } = useApplicationContext();

  const apiFetch = useApiFetch();

  async function onEmailChange(formState) {
    const { values: { email, password } } = formState;

    const response = await apiFetch('/v1/accounts/email', {
      method: 'post',
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const json = await response.json();

    if (response.status !== 200) {
      return {
        formError: json.error || 'Failed to update email',
      }
    }

    const { data: { account, token } } = json;

    dispatch((state) => ({
      ...state,
      authentication: {
        ...state.authentication,
        token: token.bearer,
        account,
      },
      snacks: [
        ...state.snacks,
        {
          id: Date.now(),
          type: 'info',
          message: 'Successfully updated email!',
        },
      ],
    }));

    localStorage.setItem('token', token.bearer);
    localStorage.setItem('token-expiration', token.expiresAt);

    return resetForm().modifier;
  }

  async function onPasswordChange(formState) {
    const { values: { currentPassword, newPassword, confirmNewPassword} } = formState;

    if (newPassword !== confirmNewPassword) {
      return {
        formError: 'New password does not match',
      }
    }

    const response = await apiFetch('/v1/accounts/password', {
      method: 'post',
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    const json = await response.json();

    if (response.status !== 200) {
      return {
        formError: json.error || 'Failed to update password',
      }
    }

    const { data: { token } } = json;

    dispatch((state) => ({
      ...state,
      authentication: {
        ...state.authentication,
        token: token.bearer,
      },
      snacks: [
        ...state.snacks,
        {
          id: Date.now(),
          type: 'info',
          message: 'Successfully updated password!',
        },
      ],
    }));

    localStorage.setItem('token', token.bearer);
    localStorage.setItem('token-expiration', token.expiresAt);

    return resetForm().modifier;
  }

  return (
    <React.Fragment>
      <Container>
        <Header>Update Your Email</Header>
        {account && (
          <Paragraph>Current email address is <EmailPlaceholder>{account.email}</EmailPlaceholder></Paragraph>
        )}
        <FormController formId="email-reset" asyncOnSubmit={onEmailChange}>
          <EmailInput />
          <PasswordInput />
          <SubmitButton
            renderButton={(buttonProps) => (
              <LightBlueButton {...buttonProps}>Update email</LightBlueButton>
            )}
          />
          <FormErrorMessage />
        </FormController>
      </Container>
      <Container>
        <Header>Update Your Password</Header>
        <ForgotPasswordLink>
          <Link to={FORGOT_PASSWORD_ROUTE}>I forgot my password</Link>
        </ForgotPasswordLink>
        <FormController formId="password-reset" asyncOnSubmit={onPasswordChange}>
          <PasswordInput
            fieldIdOverride="currentPassword"
            labelOverride="Current password"
          />
          <PasswordInput
            fieldIdOverride="newPassword"
            labelOverride="New password"
          />
          <PasswordInput
            fieldIdOverride="confirmNewPassword"
            labelOverride="Confirm new password"
          />
          <SubmitButton
            renderButton={(buttonProps) => (
              <LightBlueButton {...buttonProps}>Update password</LightBlueButton>
            )}
          />
          <FormErrorMessage />
        </FormController>
      </Container>
    </React.Fragment>
  );
}
