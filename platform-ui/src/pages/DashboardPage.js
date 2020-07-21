import React from 'react';
import styled, { css } from 'styled-components';
import useAuthorizationGate from 'hooks/useAuthorizationGate';
import useApiFetch from 'hooks/useApiFetch';
import { useApplicationContext } from 'ApplicationContext';
import OnboardingFlow from 'components/onboarding/OnboardingFlow';
import CampaignSelector from 'components/dashboard/CampaignSelector';
import NavMenu from 'components/NavMenu';
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
  max-width: 1240px;

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

const NavTabRow = styled.div`
  display: flex;
  flex-direction: row;
`;

const Tab = styled.a`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: ${({ theme }) => theme.type.weight.paragraph};
  text-align: left;
  color: ${({ theme }) => theme.colors.mono[800]};

  padding-bottom: 4px;
  margin-right: 24px;

  cursor: pointer;
  user-select: none;

  border-bottom: 4px solid ${({ theme }) => theme.colors.mono.white};

  &:hover {
    color: ${({ theme }) => theme.colors.blue.dark};
  }

  ${({ selected }) => selected && css`
    color: ${({ theme }) => theme.colors.blue.base};
    border-bottom: 4px solid ${({ theme }) => theme.colors.blue.base};
  `}
`;

const MainContainer = styled.main`
  display: flex;
  flex-direction: column;

  padding-top: 36px;
  padding-bottom: 36px;

  background-color: ${({ theme }) => theme.colors.white};
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

const PHONEBANK = 'PHONEBANK';
const SMS = 'SMS';
const RESOURCES = 'RESOURCES';

export default function DashboardPage() {
  useAuthorizationGate();

  const {
    activeCampaign,
    authentication: { account },
    dispatch,
  } = useApplicationContext();

  const [activeTab, setActiveTab] = React.useState(PHONEBANK);

  const apiFetch = useApiFetch();

  const tabs = [
    [PHONEBANK, 'Phonebank'],
    [SMS, 'Send Texts'],
    [RESOURCES, 'Volunteer Resources'],
  ];

  const accountHasCampaigns = account
    && account.campaigns
    && !!account.campaigns.length;

  function fetchCampaignAndMakeActive(id) {
    apiFetch(`/v1/campaigns/${id}`)
      .then(async (response) => {
        const json = await response.json();

        if (response.status === 200) {
          localStorage.setItem('lastActiveCampaignId', json.data.campaign.id);
          dispatch((state) => ({ ...state, activeCampaign: json.data.campaign }));
          return;
        }

        // TODO: snack error
      })
      .catch((error) => {
        console.error(error);
        // TODO: snack error
      });
  }

  React.useEffect(() => {
    const lastActiveCampaignId = localStorage.getItem('lastActiveCampaignId');

    if (!activeCampaign && lastActiveCampaignId) {
      fetchCampaignAndMakeActive(lastActiveCampaignId);
    } else if (!activeCampaign && accountHasCampaigns) {
      const id = account.campaigns[0].id;
      fetchCampaignAndMakeActive(id);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <PageContainer>
      {!!account && !accountHasCampaigns && (
        <OnboardingFlow />
      )}
      <NavContainer>
        <Row>
          <NavPlatformRow>
            <CampaignSelector />
            <NavMenu />
          </NavPlatformRow>
        </Row>
        <Row>
          <NavTabRow>
            {tabs.map((tab) => (
              <Tab
                key={tab[0]}
                selected={tab[0] === activeTab}
                onClick={() => setActiveTab(tab[0])}
                role="button"
                tabIndex="0"
                onKeyDown={(event) => (event.keyCode === 32 || event.keyCode === 13) && setActiveTab(tab[0])}
              >
                {tab[1]}
              </Tab>
            ))}
          </NavTabRow>
        </Row>
      </NavContainer>
      <MainContainer>
        <Row>
          {activeTab === PHONEBANK && (
            <Frame src={activeCampaign && activeCampaign.dialer.iframe} />
          )}
          {activeTab === SMS && (
            <Frame src={activeCampaign && activeCampaign.sms.iframe} />
          )}
        </Row>
      </MainContainer>
      <Logo src={logo} />
    </PageContainer>
  );
}
