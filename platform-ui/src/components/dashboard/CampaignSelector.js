import React from 'react';
import styled, { css } from 'styled-components';
import { useApplicationContext } from 'ApplicationContext';
import {
  CampaignLogo,
  CampaignDetails,
  CampaignTitle,
  CampaignLocation,
} from 'components/CampaignStyledComponents';
import useApiFetch from 'hooks/useApiFetch';
import useClickOutside from 'hooks/useClickOutside';

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

export default function CampaignSelector() {
  const {
    activeCampaign,
    authentication: {
      account,
    },
    dispatch,
  } = useApplicationContext();

  const apiFetch = useApiFetch();

  const [isOpen, setIsOpen] = React.useState(false);
  const [accountCampaigns, setAccountCampaigns] = React.useState(null);
  const [allCampaigns, setAllCampaigns] = React.useState(null);
  const [targetCampaign, setTargetCampaign] = React.useState(null);

  const containerRef = useClickOutside(() => setIsOpen(false));

  React.useEffect(() => {
    let cancel = false;

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
        // TODO: snack error
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
  ]);

  React.useEffect(() => {
    let cancel = false;

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
        // TODO: snack error
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

        if (response.status === 200) {
          localStorage.setItem('lastActiveCampaignId', json.data.campaign.id);

          dispatch((state) => ({
            ...state,
            activeCampaign: json.data.campaign,
            authentication: {
              ...state.authentication,
              account: json.data.account,
            },
          }));

          setAccountCampaigns(null);
          setIsOpen(false);

          return;
        }

        throw new Error(json.error || 'Failed to volunteer for campaign.');
      } catch (error) {
        console.error(error);
        // TODO: snack error
      }
    }

    if (!!targetCampaign) {
      volunteerForTargetCampaign();
    }

    return () => cancel = true;
  }, [
    apiFetch,
    dispatch,
    setTargetCampaign,
    setAccountCampaigns,
    setIsOpen,
    targetCampaign,
  ]);

  function onSwitchCampaign(toCampaign) {
    localStorage.setItem('lastActiveCampaignId', toCampaign.id);

    setIsOpen(false);
    dispatch((state) => ({ ...state, activeCampaign: toCampaign }));
  }

  function onVolunteerForCampaign(toCampaign) {
    setTargetCampaign(toCampaign);
  }

  if (!account) {
    return null;
  }

  return (
    <Container ref={containerRef}>
      <SelectedCampaignRow onClick={() => setIsOpen(!isOpen)}>
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
  );
}
