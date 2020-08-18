import React from 'react';
import styled, { css } from 'styled-components';
import { useNavigate } from '@reach/router';
import Firewall from 'components/Firewall';
import {
  CampaignLogo,
  CampaignDetails,
  CampaignTitle,
  CampaignLocation,
} from 'components/CampaignStyledComponents';
import useApiFetch from 'hooks/useApiFetch';
import useClickOutside from 'hooks/useClickOutside';
import { useApplicationContext, pushSnackError } from 'ApplicationContext';
import { DASHBOARD_CAMPAIGN_ROUTE } from 'routes';

const Container = styled.div`
  width: 100%;
  max-width: 300px;
  position: relative;
`;

const CampaignRow = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 64px;

  padding-left: 0;
  padding-right: 12px;

  background-color: ${({ theme }) => theme.colors.mono.white};
  border: 1px solid ${({ theme }) => theme.colors.mono[300]};

  cursor: pointer;
  overflow: hidden;

  &:active {
    border: 1px solid ${({ theme }) => theme.colors.mono[300]};
    outline: none;
  }
`;

const SelectedCampaignRow = styled(CampaignRow)`
  width: 100%;

  padding-right: 24px;
  border-radius: ${({ theme }) => theme.borderRadius};

  &:hover, &:focus {
    border: 1px solid ${({ theme }) => theme.colors.blue.light};
    outline: none;
  }

  &:before, &:after {
    content: '';
    position: absolute;
    display: block;
    right: 8px;

    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid ${({ theme }) => theme.colors.mono.black};
  }

  &:before {
    margin-top: -4px;
  }

  &:after {
    margin-top: 4px;
    transform: rotate(180deg);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const DropdownCampaignRow = styled(CampaignRow)`
  border: none;

  &:hover, &:focus {
    background-color: ${({ theme }) => theme.colors.blue.lightest};
  }

  ${CampaignLogo} {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
`;

const Dropdown = styled.div`
  display: flex;
  flex-direction: column;

  position: absolute;
  top: 72px;
  z-index: ${({ theme }) => theme.zIndex.dropdown};

  border: 1px solid ${({ theme }) => theme.colors.mono[400]};
  border-radius: ${({ theme }) => theme.borderRadius};

  width: 100%;
  max-height: 80vh;
  overflow-x: hidden;
  overflow-y: scroll;

  box-shadow: ${({ theme }) => theme.shadow.light};

  ${({ isLoading, theme }) => isLoading && css`
    ${DropdownCampaignRow} {
      background-color: ${({ theme }) => theme.colors.mono['300']};
      cursor: not-allowed;
    }
  `}
`;

const DropdownTitleRow = styled.span`
  width: 100%;

  font-family: ${({ theme }) => theme.font};
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  text-align: center;
  color: ${({ theme }) => theme.colors.mono.white};

  background-color: ${({ theme }) => theme.colors.purple.base};

  padding: 4px;
  padding-bottom: 6px;

  &:first-of-type {
    background-color: ${({ theme }) => theme.colors.blue.base};
    border-top-left-radius: ${({ theme }) => theme.borderRadius};
    border-top-right-radius: ${({ theme }) => theme.borderRadius};
  }
`;

export default function CampaignSelector(props) {
  const { activeCampaign } = props;

  const {
    authentication: {
      account,
    },
    dispatch,
  } = useApplicationContext();

  const apiFetch = useApiFetch();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = React.useState(false);
  const [accountCampaigns, setAccountCampaigns] = React.useState(null);
  const [allCampaigns, setAllCampaigns] = React.useState(null);
  const [targetCampaign, setTargetCampaign] = React.useState(null);
  const [firewallError, setFirewallError] = React.useState(null);

  const containerRef = useClickOutside(() => setIsOpen(false));

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

    if (apiFetch.hasTrippedCircuit('get all campaigns')) {
      return;
    }

    async function fetchAllCampaigns() {
      try {
        const response = await apiFetch('/v1/campaigns');
        const json = await response.json();

        if (cancel) {
          return;
        }

        if (response.status === 200) {
          setAllCampaigns(json.data.campaigns);
          return;
        }

        throw new Error(json.error || 'Failed to load campaigns.');
      } catch (error) {
        console.error(error);
        pushSnackError(dispatch, error);
        apiFetch.setHasTrippedCircuit('get all campaigns');
      }
    }

    if (!allCampaigns) {
      fetchAllCampaigns();
    }

    return () => cancel = true;
  }, [
    apiFetch,
    allCampaigns,
    setAllCampaigns,
    dispatch,
  ]);

  React.useEffect(() => {
    let cancel = false;

    async function volunteerForTargetCampaign() {
      try {
        const response = await apiFetch(`/v1/campaigns/${targetCampaign.id}/volunteer`, { method: 'post' });
        const json = await response.json();

        if (cancel) {
          return;
        }

        setTargetCampaign(null);

        if (response.status === 451) {
          setFirewallError(json.error);
          setIsOpen(false);
          return;
        }

        if (response.status === 200) {
          const { data: { campaign: { slug } } } = json;

          localStorage.setItem('lastActiveCampaignSlug', slug);

          dispatch((state) => ({
            ...state,
            authentication: {
              ...state.authentication,
              account: json.data.account,
            },
          }));

          setAccountCampaigns(null);
          setIsOpen(false);

          navigate(DASHBOARD_CAMPAIGN_ROUTE.replace(':slug', slug));

          return;
        }

        throw new Error(json.error || 'Failed to volunteer for campaign.');
      } catch (error) {
        console.error(error);
        pushSnackError(dispatch, error);
        setTargetCampaign(null);
      }
    }

    if (!!targetCampaign) {
      volunteerForTargetCampaign();
    }

    return () => cancel = true;
  }, [
    apiFetch,
    dispatch,
    navigate,
    setTargetCampaign,
    setAccountCampaigns,
    setIsOpen,
    targetCampaign,
  ]);

  React.useEffect(() => {
    if (
      account
      && accountCampaigns
      && account.campaigns.length !== accountCampaigns.length
    ) {
      setAccountCampaigns(null);
    }
  }, [
    account,
    accountCampaigns,
    setAccountCampaigns,
  ]);

  function onSwitchCampaign(toCampaign) {
    const { slug } = toCampaign;

    localStorage.setItem('lastActiveCampaignSlug', slug);
    navigate(DASHBOARD_CAMPAIGN_ROUTE.replace(':slug', slug));
    setIsOpen(false);
  }

  function onVolunteerForCampaign(toCampaign) {
    setTargetCampaign(toCampaign);
  }

  if (!activeCampaign) {
    // Places the NavMenu on the right
    return <div />;
  }

  return (
    <React.Fragment>
      {firewallError && (
        <Firewall
          errorMessage={firewallError}
          onClose={() => setFirewallError(null)}
        />
      )}
      <Container ref={containerRef}>
        <SelectedCampaignRow disabled={!account} onClick={() => setIsOpen(!isOpen)}>
          <CampaignLogo src={(activeCampaign || {}).logoUrl} />
          <CampaignDetails>
            <CampaignTitle>{(activeCampaign || {}).name}</CampaignTitle>
            <CampaignLocation>{(activeCampaign || {}).location}</CampaignLocation>
          </CampaignDetails>
        </SelectedCampaignRow>
        {isOpen && (
          <Dropdown isLoading={!!targetCampaign} onBlur={() => setIsOpen(false)}>
            <DropdownTitleRow>Your Campaigns</DropdownTitleRow>
            {accountCampaigns && accountCampaigns.map((campaign) => (
              <DropdownCampaignRow key={campaign.id} onClick={() => onSwitchCampaign(campaign)}>
                <CampaignLogo src={campaign.logoUrl} />
                <CampaignDetails>
                  <CampaignTitle>{campaign.name}</CampaignTitle>
                  <CampaignLocation>{campaign.location}</CampaignLocation>
                </CampaignDetails>
              </DropdownCampaignRow>
            ))}
            <DropdownTitleRow>All Campaigns</DropdownTitleRow>
            {/* TODO: Pagination when you reach the bottom */}
            {allCampaigns && allCampaigns.map((campaign) => (
              <DropdownCampaignRow key={campaign.id} onClick={() => onVolunteerForCampaign(campaign)}>
                <CampaignLogo src={campaign.logoUrl} />
                <CampaignDetails>
                  <CampaignTitle>{campaign.name}</CampaignTitle>
                  <CampaignLocation>{campaign.location}</CampaignLocation>
                </CampaignDetails>
              </DropdownCampaignRow>
            ))}
          </Dropdown>
        )}
      </Container>
    </React.Fragment>
  );
}
