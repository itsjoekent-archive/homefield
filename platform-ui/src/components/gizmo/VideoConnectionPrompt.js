import React from 'react';
import styled from 'styled-components';
import { BlueButtonInverted } from 'components/Buttons';
import { connectToVideoChat, useGizmoController } from 'components/gizmo/GizmoController';
import { useApplicationContext, pushSnackError } from 'ApplicationContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 24px;
`;

const Header = styled.h2`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.header};
  font-weight: ${({ theme }) => theme.type.weight.header};;
  text-align: center;
  color: ${({ theme }) => theme.colors.mono.white};

  margin-bottom: 12px;
`;

const Paragraph = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: ${({ theme }) => theme.type.weight.paragraph};;
  text-align: center;
  color: ${({ theme }) => theme.colors.mono.white};

  margin-bottom: 24px;
`;

export default function VideoConnectionPrompt() {
  const { dispatch: dispatchApplication } = useApplicationContext();
  const { dispatch: dispatchGizmo } = useGizmoController();

  const [requestedMedia, setRequestedMedia] = React.useState(false);

  React.useEffect(() => {
    let cancel = false;

    async function requestMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        if (cancel) {
          return;
        }

        dispatchGizmo(connectToVideoChat(stream));
      } catch(error) {
        console.error(error);
        pushSnackError(dispatchApplication, new Error('Failed to access your webcam and/or microphone'));
      }
    }

    if (requestedMedia) {
      requestMedia();
    }

    return () => cancel = true;
  }, [
    dispatchApplication,
    dispatchGizmo,
    requestedMedia,
    setRequestedMedia,
  ]);

  return (
    <Container>
      <Header>Join The Campaign Video Chat</Header>
      <Paragraph>Get in-depth trainings, chat with fellow volunteers, and get 1:1 help from campaign organizers.</Paragraph>
      <BlueButtonInverted onClick={() => setRequestedMedia(true)}>
        Connect
      </BlueButtonInverted>
    </Container>
  );
}
