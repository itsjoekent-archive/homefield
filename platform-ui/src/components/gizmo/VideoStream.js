import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import Tooltip from 'components/Tooltip';
import { useGizmoController } from 'components/gizmo/GizmoController';
import { ReactComponent as MicrophoneIcon } from 'assets/microphone-icon-white.svg';
import { ReactComponent as CameraIcon } from 'assets/camera-icon-white.svg';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;

  width: 64px;
  height: 64px;

  border-radius: 50%;

  background-color: ${({ theme }) => theme.colors.mono.white};
`;

const Video = styled.video`
  width: 58px;
  height: 58px;

  border-radius: 50%;
  overflow: hidden;

  object-fit: cover;
  object-position: center;
`;

const loadingFrames = keyframes`
  0%, 100% {
    transform: scale(0.0);
  }

  50% {
    transform: scale(1.0);
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 58px;
  height: 58px;

  border-radius: 50%;
  overflow: hidden;

  z-index: 2;

  &:before, &:after {
    content: '';
    display: block;
    position: absolute;

    width: 100%;
    height: 100%;

    border-radius: 50%;

    background-color: ${({ theme }) => theme.colors.purple.base};
    opacity: 0.5;

    animation: ${loadingFrames} 2.0s infinite ease-in-out;
  }

  &:after {
    animation: ${loadingFrames} 2.0s infinite ease-in-out;
    animation-delay: -1.0s;
  }
`;

const AvatarOverlay = styled.img`
  position: absolute;

  width: 58px;
  height: 58px;

  border-radius: 50%;
  overflow: hidden;

  object-fit: cover;
  object-position: center;

  z-index: 1;
`;

const IndicatorRow = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;

  display: flex;
  flex-direction: row;
  justify-content: flex-end;

  z-index: 2;
`;

const Indicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;

  width: 20px;
  height: 20px;

  margin-left: 2px;

  border-radius: 50%;
  overflow: hidden;

  background-color: ${({ theme }) => theme.colors.mono.black};
  box-shadow: ${({ theme }) => theme.shadow.strong};

  &:before {
    content: '';
    display: block;

    position: absolute;

    width: 75%;
    height: 2px;

    transform: rotate(45deg);

    background-color: ${({ theme }) => theme.colors.red.base};

    border-radius: ${({ theme }) => theme.borderRadius};
  }
`;

export default function VideoStream(props) {
  const {
    name,
    avatarUrl,
    mediaStream,
    isMicrophoneMuted,
    isVideoDisabled,
    muteAudio = false,
  } = props;

  const { isStick } = useGizmoController();

  const videoRef = React.useRef(null);

  React.useEffect(() => {
    if (videoRef.current && mediaStream && !videoRef.current.src) {
      videoRef.current.srcObject = mediaStream;

      try {
        videoRef.current.play();
      } catch (error) {
        console.error(error);
      }
    }
  }, [
    videoRef.current,
    mediaStream,
  ]);

  return (
    <Tooltip label={name} placement={isStick ? 'left' : 'top'} wait={0}>
      <Container>
        {!mediaStream && <LoadingOverlay />}
        {(isVideoDisabled || !mediaStream) && <AvatarOverlay src={avatarUrl} />}
        <Video ref={videoRef} muted={muteAudio} />
        <IndicatorRow>
          {isMicrophoneMuted && (
            <Indicator>
              <MicrophoneIcon width={12} height={15} />
            </Indicator>
          )}
          {isVideoDisabled && (
            <Indicator>
              <CameraIcon width={14} height={12} />
            </Indicator>
          )}
        </IndicatorRow>
      </Container>
    </Tooltip>
  );
}
