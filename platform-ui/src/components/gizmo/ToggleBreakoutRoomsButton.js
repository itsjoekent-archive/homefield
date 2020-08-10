import React from 'react';
import Tooltip from 'components/Tooltip';
import GizmoPushButton from 'components/gizmo/GizmoPushButton';
import { setViewingBreakoutRooms, useGizmoController } from 'components/gizmo/GizmoController';
import { ReactComponent as DarkBreakoutRoomIcon } from 'assets/breakout-rooms-icon-navy.svg';
import { ReactComponent as LightBroadcastIcon } from 'assets/breakout-rooms-icon-white.svg';

export default function ToggleBreakoutRoomsButton() {
  const { dispatch, isViewingBreakoutRooms } = useGizmoController();

  const label = isViewingBreakoutRooms ? 'Hide breakout rooms' : 'Breakout rooms';

  return (
    <Tooltip label={label} placement="left">
      <GizmoPushButton
        aria-label={label}
        strike={isViewingBreakoutRooms}
        darken={isViewingBreakoutRooms}
        onClick={() => dispatch(setViewingBreakoutRooms(!isViewingBreakoutRooms))}
      >
        {isViewingBreakoutRooms ? <LightBroadcastIcon /> : <DarkBreakoutRoomIcon />}
      </GizmoPushButton>
    </Tooltip>
  );
}
