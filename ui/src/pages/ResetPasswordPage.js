import React from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from '@reach/router';
import Facade from 'components/Facade';
import FacadeBlock from 'components/FacadeBlock';
import FormController from 'components/forms/FormController';
import SubmitButton from 'components/forms/SubmitButton';
import PasswordInput from 'components/forms/PasswordInput';
import FormErrorMessage from 'components/forms/FormErrorMessage';
import { LightBlueButton } from 'components/Buttons';
import useApiFetch from 'hooks/useApiFetch';
import { useApplicationContext } from 'ApplicationContext';
import { DASHBOARD_DEFAULT_ROUTE } from 'routes';

const ResetPasswordButton = styled(LightBlueButton)`
  margin-left: auto;
  margin-right: auto;
`;

export default function ResetPasswordPage() {
  const { dispatch } = useApplicationContext();

  const apiFetch = useApiFetch();
  const location = useLocation();
  const navigate = useNavigate();

  async function onReset(formState) {
    const { values: { password, confirmPassword } } = formState;

    if (password !== confirmPassword) {
      return {
        formError: 'New password does not match',
      }
    }

    const search = new URLSearchParams(location.search);
    const accountId = search.get('accountId');
    const resetToken = search.get('resetToken');

    const response = await apiFetch('/v1/accounts/reset-password', {
      method: 'post',
      body: JSON.stringify({
        accountId,
        resetToken,
        password,
      }),
    });

    const json = await response.json();

    if (response.status !== 200) {
      return {
        formError: json.error || 'Failed to reset password',
      };
    }

    const { data: { account, token } } = json;

    dispatch((state) => ({
      ...state,
      authentication: {
        ...state.authentication,
        account,
        token: token.bearer,
      },
    }));

    localStorage.setItem('token', token.bearer);
    localStorage.setItem('token-expiration', token.expiresAt);

    navigate(DASHBOARD_DEFAULT_ROUTE);
  }

  return (
    <Facade>
      <FacadeBlock title="Reset Your Password">
        <FormController formId="reset-password" asyncOnSubmit={onReset}>
          <PasswordInput
            labelOverride="New password"
          />
          <PasswordInput
            fieldIdOverride="confirmPassword"
            labelOverride="Confirm new password"
          />
          <SubmitButton
            renderButton={(buttonProps) => (
              <ResetPasswordButton {...buttonProps}>
                Reset Password
              </ResetPasswordButton>
            )}
          />
          <FormErrorMessage />
        </FormController>
      </FacadeBlock>
    </Facade>
  );
}
