import React from 'react';
import Tooltip from 'components/Tooltip';
import GizmoPushButton from 'components/gizmo/GizmoPushButton';
import { setStick, useGizmoController } from 'components/gizmo/GizmoController';
import { ReactComponent as StickModeIcon } from 'assets/stick-mode-icon-navy.svg';
import { ReactComponent as ChatModeIcon } from 'assets/chat-mode-icon-navy.svg';

export default function ToggleStickModeButton() {
  const { dispatch, isStick } = useGizmoController();

  const label = isStick ? 'Expand Organizing Hub' : 'Compact view';

  return (
    <Tooltip label={label} placement="left">
      <GizmoPushButton
        aria-label={label}
        onClick={() => dispatch(setStick(!isStick))}
      >
        {isStick ? <ChatModeIcon /> : <StickModeIcon />}
      </GizmoPushButton>
    </Tooltip>
  );
}
