import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import Tooltip from 'components/Tooltip';
import { setIsGizmoOpen, useGizmoController } from 'components/gizmo/GizmoController';
import { ReactComponent as House} from 'assets/house.svg';
import { ReactComponent as Minimize} from 'assets/minimize.svg';

const rotateLeftFrames = keyframes`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(-180deg);
  }
`;

const rotateRightFrames = keyframes`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(180deg);
  }
`;

const entrance = keyframes`
  0% {
    transform: translate(0, 100px);
  }

  50% {
    transform: translate(0, -10px);
  }

  60% {
    transform: translate(0, 0px);
  }

  70% {
    transform: translate(0, -7px);
  }

  80% {
    transform: translate(0, 0px);
  }

  90% {
    transform: translate(0, -4px);
  }

  100% {
    transform: translate(0, 0px);
  }
`;

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 70px;
  height: 70px;
  border-radius: 50%;

  background: linear-gradient(
    to bottom right,
    ${({ theme }) => theme.colors.blue.base},
    ${({ theme }) => theme.colors.purple.base}
  );

  box-shadow: ${({ theme }) => theme.shadow.strong};
  transition: box-shadow 0.5s;

  border: none;

  cursor: pointer;
  outline: none;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadow.light};
  }

  ${({ hasCompletedEntrance }) => !hasCompletedEntrance && css`
    transform: translate(0, 100px);
    animation: ${entrance} 1.5s 1s forwards;
  `}

  ${({ animateTo }) => animateTo && css`
    animation: ${animateTo === 'left' ? rotateLeftFrames : rotateRightFrames} 0.25s forwards linear;
  `}
`;

export default function FloatingButton(props) {
  const { dispatch, isOpen } = useGizmoController();

  const [hasCompletedEntrance, setHasCompletedEntrance] = React.useState(false);
  const [toggleIsOpen, setToggleIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!hasCompletedEntrance) {
      const timeoutId = setTimeout(() => {
        setHasCompletedEntrance(true);
      }, 2500);

      return () => clearTimeout(timeoutId);
    }
  }, [
    hasCompletedEntrance,
    setHasCompletedEntrance,
  ]);

  React.useEffect(() => {
    if (toggleIsOpen) {
      const timeoutId = setTimeout(() => {
        setToggleIsOpen(false);
        dispatch(setIsGizmoOpen(!isOpen));
      }, 250);

      return () => clearTimeout(timeoutId);
    }
  }, [
    dispatch,
    isOpen,
    toggleIsOpen,
    setToggleIsOpen,
  ]);

  const tooltipLabel = isOpen ? 'Minimize Organizing Hub' : 'Open Organizing Hub';
  const animateTo = toggleIsOpen ? (isOpen ? 'right' : 'left') : false;

  return (
    <Tooltip label={tooltipLabel} placement="left">
      <Button
        aria-label={animateTo}
        onClick={() => setToggleIsOpen(true)}
        animateTo={animateTo}
        hasCompletedEntrance={hasCompletedEntrance}
      >
        {isOpen ? <Minimize /> : <House />}
      </Button>
    </Tooltip>
  );
}
