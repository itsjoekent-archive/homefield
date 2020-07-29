import React from 'react';
import styled from 'styled-components';
import AccountActivityFeed from 'components/activity/AccountActivityFeed';
import CampaignActivityFeed from 'components/activity/CampaignActivityFeed';
import useApiFetch from 'hooks/useApiFetch';
import usePrevious from 'hooks/usePrevious';
import { useApplicationContext, pushSnackError } from 'ApplicationContext';

const BlankContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const BlankContainerTitle = styled.h2`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.header};
  font-weight: ${({ theme }) => theme.type.weight.header};;
  text-align: center;
  color: ${({ theme }) => theme.colors.blue.light};
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export default function Activity(props) {
  const { campaignId, username } = props;

  const { dispatch } = useApplicationContext();

  const previousCampaignId = usePrevious(campaignId);
  const previousUsername = usePrevious(username);

  const apiFetch = useApiFetch();

  const [activity, setActivity] = React.useState(null);

  React.useEffect(() => {
    if (!activity) {
      return;
    }

    if (campaignId !== previousCampaignId) {
      setActivity(null);
      return;
    }

    if (username !== previousUsername) {
      setActivity(null);
      return;
    }
  }, [
    activity,
    setActivity,
    campaignId,
    previousCampaignId,
    username,
    previousUsername,
  ]);

  React.useEffect(() => {
    let cancel = false;

    if (apiFetch.hasTrippedCircuit('get activity')) {
      return;
    }

    async function fetchActivity(path) {
      try {
        const response = await apiFetch(path);
        const json = await response.json();

        if (cancel) {
          return;
        }

        if (response.status === 200) {
          const { data: { activity } } = json;
          setActivity(activity);
          return;
        }

        throw new Error(json.error || 'Failed to load activity');
      } catch (error) {
        console.error(error);
        pushSnackError(dispatch, error);
        apiFetch.setHasTrippedCircuit('get activity');
      }
    }

    if (!activity) {
      if (campaignId) {
        fetchActivity(`/v1/campaigns/${campaignId}/activity`);
      } else if (username) {
        fetchActivity(`/v1/accounts/${username}/activity`);
      }
    }

    return () => cancel = true;
  }, [
    apiFetch,
    activity,
    dispatch,
    setActivity,
    campaignId,
    username,
  ]);

  if (!activity) {
    return null;
  }

  if (activity && !activity.length) {
    return (
      <BlankContainer>
        <BlankContainerTitle>Nothing to see here yet! <span role="img" aria-label="Eyes emoji">👀</span></BlankContainerTitle>
      </BlankContainer>
    );
  }

  // TODO: Pagination

  return (
    <Container>
      {campaignId && (
        <CampaignActivityFeed activity={activity} />
      )}
      {username && (
        <AccountActivityFeed activity={activity} />
      )}
    </Container>
  );
}
