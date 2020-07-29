import React from 'react';
import styled from 'styled-components';
import { Link } from '@reach/router';
import Prompt from 'components/Prompt';
import {
  CampaignLogo,
  CampaignDetails,
  CampaignTitle,
  CampaignLocation,
} from 'components/CampaignStyledComponents';
import { BoldTextButton, CancelButton } from 'components/Buttons';
import useApiFetch from 'hooks/useApiFetch';
import { useApplicationContext, pushSnackError } from 'ApplicationContext';
import { DASHBOARD_CAMPAIGN_ROUTE } from 'routes';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;

  margin-bottom: 72px;
`;

const Header = styled.h2`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.header};
  font-weight: ${({ theme }) => theme.type.weight.header};;
  text-align: left;
  color: ${({ theme }) => theme.colors.blue.darkest};

  margin-bottom: 36px;
`;

const CampaignContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  width: 100%;

  border-bottom: 2px solid ${({ theme }) => theme.colors.mono[300]};
  padding-bottom: 24px;
  margin-bottom: 24px;

  ${CampaignLogo} {
    border-radius: ${({ theme }) => theme.borderRadius};
  }

  ${BoldTextButton} {
    margin-right: 16px;

    a {
      color: ${({ theme }) => theme.colors.blue.darkest};
      text-transform: uppercase;
    }
  }

  &:last-child {
    border-bottom: none;
  }
`;

const CampaignInnerContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export default function AccountCampaigns() {
  const { authentication: { account }, dispatch } = useApplicationContext();

  const apiFetch = useApiFetch();

  const [accountCampaigns, setAccountCampaigns] = React.useState(null);
  const [leaveTarget, setLeaveTarget] = React.useState(null);
  const [hasConfirmedLeave, setHasConfirmedLeave] = React.useState(false);

  React.useEffect(() => {
    let cancel = false;

    if (apiFetch.hasTrippedCircuit('get account campaigns')) {
      return;
    }

    async function fetchAccountCampaigns() {
      try {
        const response = await apiFetch('/v1/account/campaigns');
        const json = await response.json();

        if (cancel) {
          return;
        }

        if (response.status === 200 && json.data.campaigns.length) {
          setAccountCampaigns(json.data.campaigns);
          return;
        }

        throw new Error(json.error || 'Failed to load campaigns you have signed up for.');
      } catch (error) {
        console.error(error);
        pushSnackError(dispatch, error);
        apiFetch.setHasTrippedCircuit('get account campaigns');
      }
    }

    if (account && account.campaigns.length && !accountCampaigns) {
      fetchAccountCampaigns();
    }

    return () => cancel = true;
  }, [
    apiFetch,
    account,
    accountCampaigns,
    setAccountCampaigns,
    dispatch,
  ]);

  React.useEffect(() => {
    let cancel = false;

    async function leaveCampaign() {
      try {
        const response = await apiFetch(`/v1/campaigns/${leaveTarget.id}/volunteer`, { method: 'delete' });
        const json = await response.json();

        if (cancel) {
          return;
        }

        if (response.status === 200) {
          dispatch((state) => ({
            ...state,
            authentication: {
              ...state.authentication,
              account: json.data.account,
            },
          }));

          setAccountCampaigns(null);
          setLeaveTarget(null);
          setHasConfirmedLeave(false);

          return;
        }

        throw new Error(json.error || 'Failed to remove the campaign from your account.');
      } catch (error) {
        console.error(error);
        pushSnackError(dispatch, error);
        setHasConfirmedLeave(false);
      }
    }

    if (leaveTarget && hasConfirmedLeave) {
      leaveCampaign();
    }

    return () => cancel = true;
  }, [
    apiFetch,
    dispatch,
    setAccountCampaigns,
    leaveTarget,
    setLeaveTarget,
    hasConfirmedLeave,
    setHasConfirmedLeave,
  ]);

  return (
    <React.Fragment>
      {leaveTarget && (
        <Prompt
          title={`Are you sure you want to leave ${leaveTarget.name}?`}
          info="You can always rejoin at a later point if you change your mind."
          confirmLabel="Leave Campaign"
          onClose={() => setLeaveTarget(null)}
          onConfirmation={() => setHasConfirmedLeave(true)}
          isLoading={hasConfirmedLeave}
        />
      )}
      <Container>
        <Header>Your Campaigns</Header>
        <div>
          {accountCampaigns && accountCampaigns.map((campaign) => (
            <CampaignContainer key={campaign.id}>
              <CampaignInnerContainer>
                <CampaignLogo src={campaign.logoUrl} />
                <CampaignDetails>
                  <CampaignTitle>{campaign.name}</CampaignTitle>
                  <CampaignLocation>{campaign.location}</CampaignLocation>
                </CampaignDetails>
              </CampaignInnerContainer>
              <CampaignInnerContainer>
                <BoldTextButton>
                  <Link to={DASHBOARD_CAMPAIGN_ROUTE.replace(':slug', campaign.slug)}>
                    Go To Campaign
                  </Link>
                </BoldTextButton>
                <CancelButton onClick={() => setLeaveTarget(campaign)}>
                  Leave Campaign
                </CancelButton>
              </CampaignInnerContainer>
            </CampaignContainer>
          ))}
        </div>
      </Container>
    </React.Fragment>
  );
}
