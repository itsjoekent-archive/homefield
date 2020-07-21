import React from 'react';
import styled from 'styled-components';
import useAuthorizationGate from 'hooks/useAuthorizationGate';
import { useApplicationContext } from 'ApplicationContext';
import OnboardingFlow from 'components/onboarding/OnboardingFlow';
import CampaignSelector from 'components/dashboard/CampaignSelector';

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

  border-bottom: 2px solid ${({ theme }) => theme.colors.mono[500]};
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

const MainContainer = styled.main`
  display: flex;
  flex-direction: column;

  padding-top: 36px;
  padding-bottom: 36px;

  background-color: ${({ theme }) => theme.colors.white};
`;

export default function DashboardPage() {
  useAuthorizationGate();

  const {
    activeCampaign,
    authentication: { account },
    dispatch,
  } = useApplicationContext();

  const accountHasCampaigns = account
    && account.campaigns
    && !!account.campaigns.length;

  function fetchCampaignAndMakeActive(id) {
    fetch(`${process.env.REACT_APP_API_URL}/v1/campaigns/${id}`)
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
  }, []);

  return (
    <PageContainer>
      {!accountHasCampaigns && (
        <OnboardingFlow />
      )}
      <NavContainer>
        <Row>
          <NavPlatformRow>
            <CampaignSelector />
          </NavPlatformRow>
        </Row>
        <Row>
          <NavTabRow>

          </NavTabRow>
        </Row>
      </NavContainer>
      <MainContainer>
        <Row>

        </Row>
      </MainContainer>
    </PageContainer>
  );
}
