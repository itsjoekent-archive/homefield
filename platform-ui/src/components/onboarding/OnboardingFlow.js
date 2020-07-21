import React from 'react';
import styled from 'styled-components';
import { useApplicationContext } from 'ApplicationContext';
import Facade, { Layout as FacadeLayout } from 'components/Facade';
import FacadeBlock from 'components/FacadeBlock';
import { LightBlueButton } from 'components/Buttons';
import {
  CampaignLogo,
  CampaignDetails,
  CampaignTitle,
  CampaignLocation,
  CampaignContainer,
} from 'components/CampaignStyledComponents';
import { ValidationErrorMessage } from 'components/forms/CommonFormStyledComponents';

const OnboardingFlowLayout = styled.div`
  ${FacadeLayout} {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }

  ${LightBlueButton} {
    margin-left: auto;
    margin-right: auto;
  }
`;

const Intro = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: ${({ theme }) => theme.type.weight.paragraph};
  text-align: center;
  color: ${({ theme }) => theme.colors.blue.darkest};
  margin-bottom: 48px;
`;

const CampaignsGrid = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
`;

export default function OnboardingFlow() {
  const [campaigns, setCampaigns] = React.useState([]);
  const [targetCampaign, setTargetCampaign] = React.useState(null);
  const [hasSubmitted, setHasSubmitted] = React.useState(null);
  const [formError, setFormError] = React.useState(null);

  const { authentication: { token }, dispatch } = useApplicationContext();

  React.useEffect(() => {
    let cancel = false;

    if (!campaigns.length) {
      fetch(`${process.env.REACT_APP_API_URL}/v1/campaigns`)
        .then(async (response) => {
          const json = await response.json();

          if (cancel) {
            return;
          }

          if (response.status === 200) {
            const { data: { campaigns } } = json;
            setCampaigns(campaigns);
            return;
          }

          setFormError(json.error || 'Encountered unexpected error retrieving campaign list. Try refreshing?');
        })
        .catch((error) => {
          console.error(error);
          setFormError('Encountered unexpected error. Try again?');
        })
    }

    return () => cancel = true;
  }, [
    campaigns,
    setCampaigns,
  ]);

  React.useEffect(() => {
    async function signup() {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/v1/campaigns/${targetCampaign.id}/volunteer`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const json = await response.json();

        if (response.status === 200) {
          localStorage.setItem('lastActiveCampaignId', targetCampaign.id);

          dispatch((state) => ({
            ...state,
            activeCampaign: targetCampaign,
            authentication: {
              ...state.authentication,
              account: json.data.account,
            },
          }));

          return;
        }

        setFormError(json.error || 'Encountered unexpected error signing up. Try again?');
      } catch (error) {
        console.error(error);
        setFormError('Encountered unexpected error. Try again?');
      }
    }

    if (hasSubmitted && targetCampaign) {
      signup();
    }
  }, [
    dispatch,
    token,
    targetCampaign,
    hasSubmitted,
    setHasSubmitted,
  ]);

  function onSubmit(event) {
    event.preventDefault();

    if (!targetCampaign) {
      setFormError('You have to select a campaign to start.');
      return;
    }

    if (formError) {
      setFormError(null);
    }

    setHasSubmitted(true);
  }

  return (
    <OnboardingFlowLayout>
      <Facade>
        <FacadeBlock maxWidth="900px" title="Join a campaign">
          <Intro>Pick the first campaign you want to join. Don't worry, you can join additional campaigns at any time!</Intro>
          <CampaignsGrid>
            {campaigns.slice(0, 6).map((campaign) => (
              <CampaignContainer
                key={campaign.id}
                type="button"
                isSelected={targetCampaign && targetCampaign.id === campaign.id}
                onClick={() => setTargetCampaign(campaign)}
              >
                <CampaignLogo src={campaign.logoUrl} />
                <CampaignDetails>
                  <CampaignTitle>{campaign.name}</CampaignTitle>
                  <CampaignLocation>{campaign.location}</CampaignLocation>
                </CampaignDetails>
              </CampaignContainer>
            ))}
          </CampaignsGrid>
          <LightBlueButton
            type="submit``"
            loading={`${(!!targetCampaign && hasSubmitted)}`}
            onClick={onSubmit}
          >Get Started</LightBlueButton>
          {formError && (
            <ValidationErrorMessage>{formError}</ValidationErrorMessage>
          )}
        </FacadeBlock>
      </Facade>
    </OnboardingFlowLayout>
  );
}
