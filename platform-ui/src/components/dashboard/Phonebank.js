import React from 'react';
import styled from 'styled-components';
import Frame from 'components/dashboard/Frame';
import ActivityReporter from 'components/activity/ActivityReporter';
import { useApplicationContext } from 'ApplicationContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Frame} {
    margin-top: 36px;
  }
`

export default function Phonebank(props) {
  const { campaign, isPartying, setIsPartying } = props;

  const { authentication: { account } } = useApplicationContext();

  return (
    <Container>
      <ActivityReporter
        campaign={campaign}
        activityType="calls"
        prompt="How did your call go?"
        verb="phone calls"
        isPartying={isPartying}
        setIsPartying={setIsPartying}
      />
      <Frame src={!!campaign && !!account && campaign.dialer.iframe} />
    </Container>
  );
}
