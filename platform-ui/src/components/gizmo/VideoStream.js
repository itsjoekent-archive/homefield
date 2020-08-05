import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useGizmoController } from 'components/gizmo/GizmoController';

const Container = styled.div`

`;

export default function VideoStream(props) {
  const {
    name,
    videoStream,
    isMicrophoneMuted,
    isVideoDisabled,
    muteAudio = false,
  } = props;

  const videoRef = React.useRef(null);

  React.useEffect(() => {
    if (videoRef.current && videoStream && !videoRef.current.src) {
      videoRef.current.srcObject = videoStream;
      videoRef.current.play();
    }
  }, [
    videoRef.current,
    videoStream,
  ]);

  return (
    <Container>
      <video ref={videoRef} muted={muteAudio} />
    </Container>
  );
}
