import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import ToggleMicrophoneButton from 'components/gizmo/ToggleMicrophoneButton';
import ToggleCameraButton from 'components/gizmo/ToggleCameraButton';
import ToggleVideoChatConnectedButton from 'components/gizmo/ToggleVideoChatConnectedButton';
import ToggleBreakoutRoomsButton from 'components/gizmo/ToggleBreakoutRoomsButton';
import ToggleStickModeButton from 'components/gizmo/ToggleStickModeButton';
import VideoConnectionPrompt from 'components/gizmo/VideoConnectionPrompt';
import VideoChatRoom from 'components/gizmo/VideoChatRoom';
import { useGizmoController } from 'components/gizmo/GizmoController';

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  justify-content: space-between;

  position: fixed;
  bottom: 102px;
  right: 12px;

  width: 100%;
  max-width: 520px;
  height: 80vh;

  box-shadow: ${({ theme }) => theme.shadow.strong};
  background: linear-gradient(
    to bottom right,
    ${({ theme }) => theme.colors.blue.base},
    ${({ theme }) => theme.colors.purple.base}
  );

  border-radius: ${({ theme }) => theme.borderRadius};

  transition: max-width 1s;
  animation: ${({ isOpen }) => isOpen ? fadeIn : fadeOut} 1s forwards;

  ${({ isStick }) => isStick && css`
    max-width: 88px;
    align-items: center;
  `}
`;

const ChatContainer = styled.div`
  width: 100%;
  flex-grow: 1;

  transition: flex-grow 1s;

  background-color: ${({ theme }) => theme.colors.mono.white};

  border-bottom-left-radius: ${({ theme }) => theme.borderRadius};
  border-bottom-right-radius: ${({ theme }) => theme.borderRadius};

  ${({ isStick }) => isStick && css`
    flex-grow: 0;
  `}
`;

const TopControlRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
`;

const TopControlRowSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ControlButtonWrapper = styled.span`
  ${({ direction, end }) => css`
    margin-${direction}: 8px;

    &:${end}-child {
      margin-${direction}: 0;
    }
  `}
`;

const StickControls = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
  align-items: center;

  margin-top: 8px;
  margin-bottom: 8px;
`;

export default function Popout() {
  const {
    isOpen,
    isStick,
    isVideoChatConnected,
  } = useGizmoController();

  const [hide, setHide] = React.useState(!isOpen);

  React.useEffect(() => {
    if (isOpen && hide) {
      setHide(false);
      return;
    }

    if (!isOpen && !hide) {
      const timeoutId = setTimeout(() => {
        setHide(true);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [
    isOpen,
    hide,
    setHide,
  ]);

  if (hide) {
    return null;
  }

  return (
    <Container isOpen={isOpen} isStick={isStick}>
      {isStick && (
        <StickControls>
          <ControlButtonWrapper direction="bottom" end="last">
            <ToggleMicrophoneButton />
          </ControlButtonWrapper>
          <ControlButtonWrapper direction="bottom" end="last">
            <ToggleCameraButton />
          </ControlButtonWrapper>
          <ControlButtonWrapper direction="bottom" end="last">
            <ToggleStickModeButton />
          </ControlButtonWrapper>
        </StickControls>
      )}
      {!isStick && isVideoChatConnected && (
        <TopControlRow>
          <TopControlRowSection>
            <ControlButtonWrapper direction="right" end="last">
              <ToggleMicrophoneButton />
            </ControlButtonWrapper>
            <ControlButtonWrapper direction="right" end="last">
              <ToggleCameraButton />
            </ControlButtonWrapper>
          </TopControlRowSection>
          <TopControlRowSection>
            <ControlButtonWrapper direction="left" end="first">
              <ToggleVideoChatConnectedButton />
            </ControlButtonWrapper>
            <ControlButtonWrapper direction="left" end="first">
              <ToggleBreakoutRoomsButton />
            </ControlButtonWrapper>
            <ControlButtonWrapper direction="left" end="first">
              <ToggleStickModeButton />
            </ControlButtonWrapper>
          </TopControlRowSection>
        </TopControlRow>
      )}
      {!isStick && !isVideoChatConnected && (
        <VideoConnectionPrompt />
      )}
      {isVideoChatConnected && (
        <VideoChatRoom />
      )}
      <ChatContainer isStick={isStick}>

      </ChatContainer>
    </Container>
  );
}
