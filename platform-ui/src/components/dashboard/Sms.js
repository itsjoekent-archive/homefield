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
`;

export default function Sms(props) {
  const { campaign } = props;

  const { authentication: { account } } = useApplicationContext();

  return (
    <Container>
      <ActivityReporter
        campaign={campaign}
        prompt="How did your conversation go?"
        verb="sms conversations"
      />
      <Frame src={!!campaign && !!account && campaign.dialer.sms} />
    </Container>
  );
}
