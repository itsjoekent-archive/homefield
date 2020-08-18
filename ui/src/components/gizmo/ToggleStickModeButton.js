import React from 'react';
import Tooltip from 'components/Tooltip';
import GizmoPushButton from 'components/gizmo/GizmoPushButton';
import { setStick, useGizmoController } from 'components/gizmo/GizmoController';
import { ReactComponent as StickModeIcon } from 'assets/stick-mode-icon-navy.svg';
import { ReactComponent as ExpandedModeIcon } from 'assets/expanded-mode-icon-navy.svg';

export default function ToggleStickModeButton() {
  const { dispatch, isStick } = useGizmoController();

  const label = isStick ? 'Expand Organizing Hub' : 'Condense Organizing Hub';

  return (
    <Tooltip label={label} placement="left">
      <GizmoPushButton
        aria-label={label}
        onClick={() => dispatch(setStick(!isStick))}
      >
        {isStick ? <ExpandedModeIcon /> : <StickModeIcon />}
      </GizmoPushButton>
    </Tooltip>
  );
}
