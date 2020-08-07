import React from 'react';
import styled from 'styled-components';
import VideoStream from 'components/gizmo/VideoStream';
import { useGizmoController } from 'components/gizmo/GizmoController';
import { useApplicationContext } from 'ApplicationContext';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

export default function VideoStreamList() {
  const {
    mediaStream,
    isStick,
    isBroadcasting,
    isMuted,
  } = useGizmoController();

  const {
    authentication: {
      account: {
        firstName,
        lastName,
        avatarUrl,
      },
    },
  } = useApplicationContext();

  return (
    <Container>
      {mediaStream && (
        <VideoStream
          name={`${firstName}${lastName ? ` ${lastName}` : ''}`}
          avatarUrl={avatarUrl}
          videoStream={mediaStream}
          isMicrophoneMuted={isMuted}
          isVideoDisabled={!isBroadcasting}
          muteAudio
        />
      )}
    </Container>
  );
}
