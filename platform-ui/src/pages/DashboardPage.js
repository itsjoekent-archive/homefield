import React from 'react';
import styled, { css } from 'styled-components';
import { Router, useNavigate, useLocation } from '@reach/router';
import useAuthorizationGate from 'hooks/useAuthorizationGate';
import useApiFetch from 'hooks/useApiFetch';
import { useApplicationContext } from 'ApplicationContext';
import OnboardingFlow from 'components/onboarding/OnboardingFlow';
import CampaignSelector from 'components/dashboard/CampaignSelector';
import CampaignVolunteerPrompt from 'components/dashboard/CampaignVolunteerPrompt';
import NavMenu from 'components/NavMenu';
import TabbedNavigation from 'components/TabbedNavigation';
import ActivityFeed from 'components/activity/ActivityFeed';
import { DASHBOARD_CAMPAIGN_ROUTE } from 'routes';
import logo from 'assets/logo-name-blue-100.png';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;

  width: 100%;
  min-height: 100vh;

  background-color: ${({ theme }) => theme.colors.white};
`;

const NavContainer = styled.nav`
  display: flex;
  flex-direction: column;

  background-color: ${({ theme }) => theme.colors.mono[200]};
  border-bottom: 2px solid ${({ theme }) => theme.colors.mono[400]};

  padding-top: 12px;
`;

const Row = styled.div`
  display: block;

  width: 100%;
  max-width: ${({ theme }) => theme.maxWidth};

  margin-left: auto;
  margin-right: auto;

  padding-left: 24px;
  padding-right: 24px;
`;

const NavPlatformRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  margin-bottom: 36px;
`;

const MainContainer = styled.main`
  display: flex;
  flex-direction: column;

  padding-top: 36px;
  padding-bottom: 36px;

  background-color: ${({ theme }) => theme.colors.mono.white};

  border-bottom: 1px solid ${({ theme }) => theme.colors.mono[400]};
`;

const Frame = styled.iframe`
  width: 100%;
  min-height: 80vh;

  border: none;

  ${({ src }) => !src && css`
    background: linear-gradient(to right, #000 33%, #fff 0%) top/10px 1px repeat-x,
                linear-gradient(#000 33%, #fff 0%) right/1px 10px repeat-y,
                linear-gradient(to right, #000 33%, #fff 0%) bottom/10px 1px repeat-x,
                linear-gradient(#000 33%, #fff 0%) left/1px 10px repeat-y;
  `}
`;

const Logo = styled.img`
  width: 200px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 24px;
  margin-bottom: 24px;
`;

const ACTIVITY = './';
const PHONEBANK = 'phonebank';
const SMS = 'sms';
const RESOURCES = 'resources';

export default function DashboardPage(props) {
  const { slug } = props;

  const hasAttemptedAuthorization = useAuthorizationGate(false);

  const {
    authentication: { account },
    dispatch,
  } = useApplicationContext();

  const [activeCampaign, setActiveCampaign] = React.useState(null);

  const apiFetch = useApiFetch();
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    [ACTIVITY, 'Recent Activity'],
    [PHONEBANK, 'Phonebank'],
    [SMS, 'Send Texts'],
    [RESOURCES, 'Volunteer Resources'],
  ];

  const accountHasCampaigns = account
    && account.campaigns
    && !!account.campaigns.length;

  React.useEffect(() => {
    let cancel = false;

    async function fetchCampaignAndMakeActive(qualifier, value) {
      try {
        const response = await apiFetch(`/v1/campaigns/${qualifier}/${value}`);
        const json = await response.json();

        if (cancel) {
          return;
        }

        if (response.status === 200) {
          localStorage.setItem('lastActiveCampaignSlug', json.data.campaign.slug);
          setActiveCampaign(json.data.campaign);

          if (!slug || slug !== json.data.campaign.slug) {
            navigate(DASHBOARD_CAMPAIGN_ROUTE.replace(':slug', json.data.campaign.slug));
          }

          return;
        }

        throw new Error(json.error || 'Failed to load campaign');
      } catch (error) {
        console.error(error);
        // TODO: snack error
      }
    }

    const lastActiveCampaignSlug = localStorage.getItem('lastActiveCampaignSlug');

    if (!slug && lastActiveCampaignSlug) {
      fetchCampaignAndMakeActive('slug', lastActiveCampaignSlug);
    } else if (!slug && accountHasCampaigns) {
      const id = account.campaigns[0];
      fetchCampaignAndMakeActive('id', id);
    } else if ((slug && !activeCampaign) || (slug && activeCampaign && slug !== activeCampaign.slug)) {
      fetchCampaignAndMakeActive('slug', slug);
    }

    return () => cancel = true;
  }, [
    account,
    accountHasCampaigns,
    activeCampaign,
    apiFetch,
    dispatch,
    navigate,
    setActiveCampaign,
    slug,
  ]);

  React.useEffect(() => {
    if (activeCampaign) {
      const compareUrl = DASHBOARD_CAMPAIGN_ROUTE.replace(':slug', activeCampaign.slug);

      if (!location.pathname.startsWith(compareUrl)) {
        setActiveCampaign(null);
      }
    }
  }, [
    activeCampaign,
    setActiveCampaign,
    location,
    navigate,
  ]);

  function onPromptConfirmation(account, campaign) {
    setActiveCampaign(campaign);

    dispatch((state) => ({
      ...state,
      authentication: {
        ...state.authentication,
        account,
      },
    }));
  }

  const isNotVolunteeringForActiveCampaign = !!account
    && accountHasCampaigns
    && !!activeCampaign
    && !account.campaigns.includes(activeCampaign.id);

  return (
    <PageContainer>
      {!!account && !accountHasCampaigns && (
        <OnboardingFlow />
      )}
      {isNotVolunteeringForActiveCampaign && (
        <CampaignVolunteerPrompt
          campaign={activeCampaign}
          onConfirmation={onPromptConfirmation}
        />
      )}
      {!account && hasAttemptedAuthorization && (
        <CampaignVolunteerPrompt
          campaign={activeCampaign}
          onConfirmation={onPromptConfirmation}
        />
      )}
      <NavContainer>
        <Row>
          <NavPlatformRow>
            <CampaignSelector activeCampaign={activeCampaign} />
            <NavMenu />
          </NavPlatformRow>
        </Row>
        <Row>
          <TabbedNavigation tabs={tabs} />
        </Row>
      </NavContainer>
      <MainContainer>
        <Row>
          <Router>
            <ActivityFeed
              path="/"
              campaignId={activeCampaign && activeCampaign.id}
            />
            <Frame
              path={PHONEBANK}
              src={!!activeCampaign && !!account && activeCampaign.dialer.iframe}
            />
            <Frame
              path={SMS}
              src={!!activeCampaign && !!account && activeCampaign.sms.iframe}
            />
          </Router>
        </Row>
      </MainContainer>
      <Logo src={logo} />
    </PageContainer>
  );
}
