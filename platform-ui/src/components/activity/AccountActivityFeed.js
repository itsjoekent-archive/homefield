import React from 'react';
import ago from 's-ago';
import styled from 'styled-components';
import { useNavigate } from '@reach/router';
import Prompt from 'components/Prompt';
import {
  ActivityRow,
  ActivityDetails,
  Avatar,
  ActivityDescription,
  ActivityTimestamp,
} from 'components/activity/ActivityStyledComponents';
import useApiFetch from 'hooks/useApiFetch';
import { DASHBOARD_ROUTE } from 'routes';
import { useApplicationContext } from 'ApplicationContext';

const AvatarButton = styled.button`
  background: none;
  border: none;
`;

export default function AccountActivityFeed(props) {
  const { activity } = props;

  const apiFetch = useApiFetch();
  const navigate = useNavigate();

  const { authentication: { account }, dispatch } = useApplicationContext();

  const [confirmationTarget, setConfirmationTarget] = React.useState(null);
  const [hasConfirmed, setHasConfirmed] = React.useState();

  React.useEffect(() => {
    async function onVolunteerForCampaign() {
      try {
        const response = await apiFetch(`/v1/campaigns/${confirmationTarget.id}/volunteer`, { method: 'post' });
        const json = await response.json();

        if (response.status === 200) {
          dispatch((state) => ({ ...state, activeCampaign: confirmationTarget }));
          navigate(DASHBOARD_ROUTE);
          return;
        }

        throw new Error(json.error || 'Failed to signup for campaign');
      } catch (error) {
        console.error(error);
        // TODO: snack error
      }
    }

    if (confirmationTarget && hasConfirmed) {
      setHasConfirmed(false);
      onVolunteerForCampaign();
    }
  }, [
    apiFetch,
    dispatch,
    navigate,
    confirmationTarget,
    hasConfirmed,
  ]);

  function onCampaignClick(campaign) {
    if (account && account.campaigns.find((compareId) => compareId === campaign.id)) {
      dispatch((state) => ({ ...state, activeCampaign: campaign }));
      navigate(DASHBOARD_ROUTE);
      return;
    }

    if (account) {
      setConfirmationTarget(campaign);
      return;
    }

    // TODO: redirect to invite page
  }

  return (
    <React.Fragment>
      {confirmationTarget && (
        <Prompt
          title={`Sign up to volunteer for ${confirmationTarget.name}`}
          info={`Help ${confirmationTarget.name} make calls, send texts, and get out the vote!`}
          confirmLabel="Sign up"
          onClose={() => setConfirmationTarget(null)}
          onConfirmation={() => setHasConfirmed(true)}
          isAsync
        />
      )}
      {activity.map((item) => (
        <ActivityRow key={item.id}>
          <AvatarButton onClick={() => onCampaignClick(item.campaign)}>
            <Avatar src={item.campaign.logoUrl} />
          </AvatarButton>
          <ActivityDetails>
            {(() => {
              switch (item.type) {
                case 'joined':
                  return (
                    <ActivityDescription>
                      {item.account.firstName} joined the {item.campaign.name} campaign.
                    </ActivityDescription>
                  );
                default:
                  return null;
              }
            })()}
            <ActivityTimestamp>
              {ago(new Date(item.createdAt))}
            </ActivityTimestamp>
          </ActivityDetails>
        </ActivityRow>
      ))}
    </React.Fragment>
  );
}
