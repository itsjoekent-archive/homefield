import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import GizmoPushButton from 'components/gizmo/GizmoPushButton';
import ToggleMicrophoneButton from 'components/gizmo/ToggleMicrophoneButton';
import ToggleBroadcastButton from 'components/gizmo/ToggleBroadcastButton';
import { setStick, useGizmoController } from 'components/gizmo/GizmoController';

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
  `}
`;

const ChatContainer = styled.div`
  width: 100%;
  height: 60%;

  transition: height 1s;

  background-color: ${({ theme }) => theme.colors.mono.white};

  border-bottom-left-radius: ${({ theme }) => theme.borderRadius};
  border-bottom-right-radius: ${({ theme }) => theme.borderRadius};

  ${({ isStick }) => isStick && css`
    height: 0px;
  `}
`;

const TopControlRow = styled.div`
  display: flex;
  flex-direction: row;
  padding: 8px;
`;

const ControlButtonWrapper = styled.span`
  margin-right: 12px;

  &:last-child {
    margin-right: 0;
  }
`;

export default function Popout() {
  const { dispatch, isOpen, isStick } = useGizmoController();

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
      <TopControlRow>
        <ControlButtonWrapper>
          <ToggleMicrophoneButton />
        </ControlButtonWrapper>
        <ControlButtonWrapper>
          <ToggleBroadcastButton />
        </ControlButtonWrapper>
      </TopControlRow>
      <button onClick={() => dispatch(setStick(!isStick))}>{`isStick: ${isStick}`}</button>
      <ChatContainer isStick={isStick}>

      </ChatContainer>
    </Container>
  );
}
