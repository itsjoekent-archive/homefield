import React from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from '@reach/router';
import Prompt from 'components/Prompt';
import Firewall from 'components/Firewall';
import { LightBlueButton, BoldTextButton } from 'components/Buttons';
import FormController from 'components/forms/FormController';
import EmailInput from 'components/forms/EmailInput';
import PasswordInput from 'components/forms/PasswordInput';
import TextInput from 'components/forms/TextInput';
import SubmitButton from 'components/forms/SubmitButton';
import FormErrorMessage from 'components/forms/FormErrorMessage';
import requiredTextValidator from 'components/forms/requiredTextValidator';
import useApiFetch from 'hooks/useApiFetch';
import { DASHBOARD_DEFAULT_ROUTE, LOGIN_ROUTE } from 'routes';
import { useApplicationContext, pushSnackError } from 'ApplicationContext';

const SignupContainer = styled.div`
  padding: 24px;
`;

const SignupButton = styled(LightBlueButton)`
  margin-left: auto;
  margin-right: auto;
`;

const LoginButton = styled(BoldTextButton)`
  display: block;
  width: fit-content;

  margin-top: 16px;
  margin-left: auto;
  margin-right: auto;

  a {
    text-align: center;
    color: ${({ theme }) => theme.colors.blue.darkest};
  }
`;

const SignupHero = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  width: 100%;
  height: 256px;
  position: relative;

  background-image: url(${({ src }) => src});
  background-size: cover;
  background-position: center;

  padding: 24px;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.75));
  }
`;

const HeroTitle = styled.h1`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.title};
  font-weight: ${({ theme }) => theme.type.size.title};
  text-align: left;
  color: ${({ theme }) => theme.colors.mono.white};
  z-index: 1;
`;

const HeroParagraph = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: ${({ theme }) => theme.type.weight.paragraph};
  color: ${({ theme }) => theme.colors.blue.darkest};

  margin-bottom: 24px;
`;

export default function CampaignVolunteerPrompt(props) {
  const { campaign, onConfirmation } = props;

  const apiFetch = useApiFetch();
  const location = useLocation();
  const navigate = useNavigate();

  const { authentication: { account }, dispatch } = useApplicationContext();

  const [hasConfirmed, setHasConfirmed] = React.useState();
  const [firewallError, setFirewallError] = React.useState(null);

  React.useEffect(() => {
    let cancel = false;

    if (apiFetch.hasTrippedCircuit('volunteer for campaign')) {
      return;
    }

    async function onVolunteerForCampaign() {
      try {
        const response = await apiFetch(`/v1/campaigns/${campaign.id}/volunteer`, { method: 'post' });
        const json = await response.json();

        if (cancel) {
          return;
        }

        setHasConfirmed(false);

        if (response.status === 451) {
          setFirewallError(json.error);
          return;
        }

        if (response.status === 200) {
          onConfirmation(json.data.account, json.data.campaign);
          return;
        }

        throw new Error(json.error || 'Failed to signup for campaign');
      } catch (error) {
        console.error(error);
        pushSnackError(dispatch, error);
        apiFetch.setHasTrippedCircuit('volunteer for campaign');
      }
    }

    if (hasConfirmed) {
      onVolunteerForCampaign();
    }

    return () => cancel = true;
  }, [
    apiFetch,
    dispatch,
    campaign,
    hasConfirmed,
    onConfirmation,
  ]);

  async function onSignup(state) {
    const { values: { firstName, email, password } } = state;

    const signupResponse = await apiFetch('/v1/accounts', {
      method: 'post',
      body: JSON.stringify({
        firstName,
        email,
        password,
      }),
    });

    const signupJson = await signupResponse.json();

    if (signupResponse.status !== 200) {
      return {
        formError: signupJson.error || 'Failed to signup',
      }
    }

    const { data: { token } } = signupJson;

    dispatch((state) => ({
      ...state,
      authentication: {
        ...state.authentication,
        token: token.bearer,
      },
    }));

    localStorage.setItem('token', token.bearer);
    localStorage.setItem('token-expiration', token.expiresAt);

    const volunteerResponse = await apiFetch(`/v1/campaigns/${campaign.id}/volunteer`, {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${token.bearer}`,
      },
    });

    const volunteerJson = await volunteerResponse.json();

    if (volunteerResponse.status !== 200) {
      return {
        formError: volunteerJson.error || 'Failed to volunteer',
      }
    }

    onConfirmation(volunteerJson.data.account, volunteerJson.data.campaign);
  }

  if (!campaign) {
    return null;
  }

  if (!account) {
    return (
      <Prompt>
        <SignupHero src={campaign.logoUrl}>
          <HeroTitle>{campaign.name}</HeroTitle>
        </SignupHero>
        <SignupContainer>
          <HeroParagraph>Help {campaign.name} make calls, send texts, and get out the vote!</HeroParagraph>
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
          <LoginButton>
            <Link to={`${LOGIN_ROUTE}?returnTo=${location.pathname}`}>
              Log in to existing account
            </Link>
          </LoginButton>
        </SignupContainer>
      </Prompt>
    );
  }

  function onClose() {
    localStorage.removeItem('lastActiveCampaignSlug');
    navigate(DASHBOARD_DEFAULT_ROUTE);
  }

  if (firewallError) {
    return (
      <Firewall
        errorMessage={firewallError}
        onClose={() => setFirewallError(null)}
      />
    );
  }

  return (
    <Prompt
      title={`Sign up to volunteer for ${campaign.name}`}
      info={`Help ${campaign.name} make calls, send texts, and get out the vote!`}
      confirmLabel="Sign up"
      onClose={onClose}
      onConfirmation={() => setHasConfirmed(true)}
      isLoading={hasConfirmed}
    />
  );
}
