import React from 'react';
import Tooltip from 'components/Tooltip';
import GizmoPushButton from 'components/gizmo/GizmoPushButton';
import { setBroadcast, useGizmoController } from 'components/gizmo/GizmoController';
import { ReactComponent as DarkBroadcastIcon } from 'assets/broadcast-icon-navy.svg';
import { ReactComponent as LightBroadcastIcon } from 'assets/broadcast-icon-white.svg';

export default function ToggleBroadcastButton() {
  const { dispatch, isBroadcasting, isStick } = useGizmoController();

  const label = isBroadcasting ? 'Hide video' : 'Share video';

  return (
    <Tooltip label={label} placement={isStick ? 'left' : 'top'}>
      <GizmoPushButton
        aria-label={label}
        strike={!isBroadcasting}
        darken={!isBroadcasting}
        onClick={() => dispatch(setBroadcast(!isBroadcasting))}
      >
        {isBroadcasting ? <DarkBroadcastIcon /> : <LightBroadcastIcon />}
      </GizmoPushButton>
    </Tooltip>
  );
}
