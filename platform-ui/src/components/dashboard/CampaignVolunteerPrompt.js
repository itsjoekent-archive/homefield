import React from 'react';
import Prompt from 'components/Prompt';
import useApiFetch from 'hooks/useApiFetch';
import { useApplicationContext } from 'ApplicationContext';

export default function CampaignVolunteerPrompt(props) {
  const { campaign, onConfirmation } = props;

  const apiFetch = useApiFetch();
  const { authentication: { account } } = useApplicationContext();

  const [hasConfirmed, setHasConfirmed] = React.useState();

  React.useEffect(() => {
    let cancel = false;

    async function onVolunteerForCampaign() {
      try {
        const response = await apiFetch(`/v1/campaigns/${campaign.id}/volunteer`, { method: 'post' });
        const json = await response.json();

        if (cancel) {
          return;
        }

        setHasConfirmed(false);

        if (response.status === 200) {
          onConfirmation(json.data.account);
          return;
        }

        throw new Error(json.error || 'Failed to signup for campaign');
      } catch (error) {
        console.error(error);
        // TODO: snack error
      }
    }

    if (hasConfirmed) {
      onVolunteerForCampaign();
    }

    return () => cancel = true;
  }, [
    apiFetch,
    campaign,
    hasConfirmed,
    onConfirmation,
  ]);

  if (!account) {
    return (
      <Prompt>
        <h1>test</h1>
      </Prompt>
    );
  }

  return (
    <Prompt
      title={`Sign up to volunteer for ${campaign.name}`}
      info={`Help ${campaign.name} make calls, send texts, and get out the vote!`}
      confirmLabel="Sign up"
      onCancel={() => {}}
      onConfirmation={() => setHasConfirmed(true)}
      isLoading={hasConfirmed}
    />
  );
}
